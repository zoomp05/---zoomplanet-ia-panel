import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Tag, Button, Space, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  CREATE_CONTACT,
  UPDATE_CONTACT,
  GET_CONTACT_TAGS,
  CREATE_CONTACT_TAG,
} from "../../apollo/contact";
import { toast } from "react-hot-toast";
//import TagSelector from '../../../../components/Select/TagSelector';

const COLORS = ["blue", "green", "red", "orange", "purple", "cyan", "magenta"];

const ContactModal = ({ visible, contact, onClose }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [form] = Form.useForm();
  const isEditing = !!contact;

  const [getTags, { data: tagData }] = useLazyQuery(GET_CONTACT_TAGS);
  const [createContactTag] = useMutation(CREATE_CONTACT_TAG);
  const [createContact, { loading: createLoading }] =
    useMutation(CREATE_CONTACT);
  const [updateContact, { loading: updateLoading }] =
    useMutation(UPDATE_CONTACT);

  const [tagOptions, setTagOptions] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const inputRef = useRef(null);
  const selectRef = useRef(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Detectar cambios en el formulario
    const handleValuesChange = () => {
      setIsDirty(true);
    };
    form.setFieldsValue({}); // Para inicializar listeners
    form.setFieldsValue = new Proxy(form.setFieldsValue, {
      apply(target, thisArg, argumentsList) {
        setIsDirty(false);
        return Reflect.apply(target, thisArg, argumentsList);
      }
    });
    form.onFieldsChange = handleValuesChange;
    if (tagData) {
      setTagOptions(
        tagData.contactTags.map((tag) => ({
          label: <Tag color={tag.color}>{tag.name}</Tag>,
          value: tag.name, // Cambiado: solo usar el nombre como value
          data: { name: tag.name, color: tag.color } // Mantener los datos completos en una prop separada
        }))
      );
    }
  }, [tagData]);

  useEffect(() => {
    if (visible && contact) {
      form.setFieldsValue({
        email: contact.email,
        name: contact.name,
        type: contact.type,
        status: contact.status,
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        address: contact.address,
        tags: contact.tags.map(tag => tag.name),
        notes: contact.notes,
        generatedAt: contact.generatedAt ? new Date(contact.generatedAt).toISOString().slice(0, 10) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [visible, contact, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convertir los nombres de tags a objetos completos, si existen tags
      const formattedValues = {
        ...values,
        tags: values.tags?.map(tagName => {
          const tagOption = tagOptions.find(opt => opt.value === tagName);
          return tagOption ? tagOption.data : { name: tagName, color: COLORS[0] };
        }) || [] // Añadir array vacío como valor por defecto
      };

      let response;
      if (isEditing) {
        // Eliminar el campo email del input para updateContact
        //const { email, ...updateInput } = formattedValues;
        response = await updateContact({
          variables: {
            id: contact.id,
            input: formattedValues,
          },
        });
      } else {
        response = await createContact({
          variables: {
            input: formattedValues,
          },
        });
      }

      const result = isEditing ? response.data?.updateContact : response.data?.createContact;
  
      // Handle GraphQL errors
      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'An error occurred');
      }
  
      // Handle validation errors
      if (result?.__typename === 'ValidationError') {
        throw new Error(result.message || 'Validation error');
      }
  
      // Handle bad input errors
      if (result?.__typename === 'BAD_USER_INPUT') {
        throw new Error(result.message || 'Invalid input');
      }
  
      // Success case
      if (result?.__typename === 'Contact') {
        toast.success(isEditing ? 'Contact updated successfully' : 'Contact created successfully');
        onClose(true);
      } else {
        throw new Error('Unexpected response type');
      }
  
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleCreateTag = async (tagName) => {
    try {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const { data } = await createContactTag({
        variables: {
          input: {
            name: tagName,
            color: randomColor,
          },
        },
      });

      if (data?.createContactTag) {
        const newTag = data.createContactTag;
        setTagOptions((prev) => [
          ...prev,
          {
            label: <Tag color={newTag.color}>{newTag.name}</Tag>,
            value: newTag.name,
            data: { name: newTag.name, color: newTag.color }
          },
        ]);

        const currentTags = form.getFieldValue("tags") || [];
        form.setFieldValue("tags", [...currentTags, newTag.name]);

        setSearchText("");
        toast.success("Tag created successfully");
      }
    } catch (error) {
      toast.error("Error creating tag");
      console.error("Error creating tag:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      getTags({ variables: { search: value } });
    }
  };

  const handleSelect = (value, option) => {
    setSearchText("");
  };

  const handleFocus = () => {
    if (!searchText && !tagOptions.length) {
      getTags({ variables: { search: "" } });
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Contact" : "Create Contact"}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        if (isDirty) {
          setConfirmClose(true);
        } else {
          onClose();
        }
      }}
      confirmLoading={createLoading || updateLoading}
      maskClosable={false}
    >
      {confirmClose && (
        <Modal
          open={true}
          title="¿Cerrar sin guardar?"
          onOk={() => { setConfirmClose(false); onClose(); }}
          onCancel={() => setConfirmClose(false)}
        >
          <p>Hay cambios sin guardar en el formulario. ¿Seguro que quieres cerrar?</p>
        </Modal>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email", message: "Please input a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select a type!" }]}
        >
          <Select>
            <Select.Option value="LEAD">Lead</Select.Option>
            <Select.Option value="CUSTOMER">Customer</Select.Option>
            <Select.Option value="SUBSCRIBER">Subscriber</Select.Option>
            <Select.Option value="PARTNER">Partner</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select a status!" }]}
        >
          <Select>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="UNSUBSCRIBED">Unsubscribed</Select.Option>
            <Select.Option value="BOUNCED">Bounced</Select.Option>
            <Select.Option value="COMPLAINED">Complained</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>

        <Form.Item name="whatsapp" label="WhatsApp">
          <Input />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="multiple"
            options={tagOptions}
            onSearch={handleSearch}
            onSelect={handleSelect}
            searchValue={searchText}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (
                  searchText &&
                  !tagOptions.find((t) => t.value === searchText)
                ) {
                  handleCreateTag(searchText);
                }
              }
            }}
            notFoundContent={null}
            filterOption={false}
          />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={4} />
        </Form.Item>
          <Form.Item name="generatedAt" label="Generado el">
            <Input type="date" />
          </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactModal;
