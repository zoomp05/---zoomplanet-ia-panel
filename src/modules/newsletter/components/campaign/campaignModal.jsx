import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Checkbox } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CAMPAIGN, UPDATE_CAMPAIGN } from '../../apollo/campaign';
import { GET_CONTACT_GROUPS } from '../../apollo/contactGroup';
import { GET_CONTACTS } from '../../apollo/contact';
import { GET_NEWSLETTERS } from '../../apollo/newsletter';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CampaignModal = ({ visible, campaign, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!campaign;

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [createCampaign, { loading: createLoading }] = useMutation(CREATE_CAMPAIGN);
  const [updateCampaign, { loading: updateLoading }] = useMutation(UPDATE_CAMPAIGN);
  const { data: contactsData, loading: loadingContacts } = useQuery(GET_CONTACTS);
  const { data: newslettersData, loading: loadingNewsletters } = useQuery(GET_NEWSLETTERS);
  const { data: contactGroupsData, loading: loadingContactGroups } = useQuery(GET_CONTACT_GROUPS);

  useEffect(() => {
    if (visible && campaign) {
      setStartDate(campaign.startDate ? moment(campaign.startDate).toDate() : null);
      setEndDate(campaign.endDate ? moment(campaign.endDate).toDate() : null);
      form.setFieldsValue({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        targetTags: campaign.targetTags,
        contactGroups: campaign.contactGroups?.map(g => g.id),
        newsletters: campaign.newsletters?.map(n => n.id),
        startDate: campaign.startDate ? moment(campaign.startDate).toDate() : null,
        endDate: campaign.endDate ? moment(campaign.endDate).toDate() : null,
        sendRandomly: campaign.sendRandomly || false,
        interval: campaign.interval || 0,
      });
    } else {
      form.resetFields();
      setStartDate(null);
      setEndDate(null);
    }
  }, [visible, campaign, form]);

  const handleSubmit = async () => {
    try {
      const fieldsValue = await form.validateFields();
      const values = {
        ...fieldsValue,
        startDate: startDate ? moment(startDate).toISOString() : null,
        endDate: endDate ? moment(endDate).toISOString() : null,
        interval: parseInt(fieldsValue.interval, 10),
        sendRandomly: fieldsValue.sendRandomly === true ? true : false,
      };

      if (isEditing) {
        await updateCampaign({
          variables: {
            id: campaign.id,
            input: values
          }
        });
        toast.success('Campaign updated successfully');
      } else {
        await createCampaign({
          variables: {
            input: values
          }
        });
        toast.success('Campaign created successfully');
      }

      onClose(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Campaign' : 'Create Campaign'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      confirmLoading={createLoading || updateLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAUSED', label: 'Paused' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="contactGroups"
          label="Contact Groups"
        >
          <Select
            mode="multiple"
            loading={loadingContactGroups}
            placeholder="Select contact groups"
            optionFilterProp="label"
            options={contactGroupsData?.contactGroups?.edges?.map(group => ({
              value: group.id,
              label: `${group.name} (${group.contacts?.length} contacts)`
            }))}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="targetTags"
          label="Target Tags"
        >
          <Select mode="tags" />
        </Form.Item>

        <Form.Item
          name="newsletters"
          label="Newsletters"
          rules={[{ required: true, message: 'Please select at least one newsletter' }]}
        >
          <Select
            mode="multiple"
            loading={loadingNewsletters}
            placeholder="Select newsletters"
            optionFilterProp="label"
            options={newslettersData?.newsletters?.edges?.map(newsletter => ({
              value: newsletter.id,
              label: newsletter.name
            }))}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select a start date' }]}
        >
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              form.setFieldsValue({ startDate: date });
            }}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm:ss"
            className="ant-input"
          />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
        >
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              form.setFieldsValue({ endDate: date });
            }}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm:ss"
            className="ant-input"
          />
        </Form.Item>

        <Form.Item
          name="sendRandomly"
          valuePropName="checked"
        >
          <Checkbox>Send newsletters randomly</Checkbox>
        </Form.Item>

        <Form.Item
          name="interval"
          label="Interval (in minutes)"
          rules={[{ required: true, message: 'Please enter an interval' }]}
        >
          <Input type="number" />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default CampaignModal;
