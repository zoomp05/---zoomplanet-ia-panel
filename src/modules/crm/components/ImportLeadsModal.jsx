import React, { useState, useMemo } from "react";
import {
  Modal,
  Upload,
  Card,
  Space,
  Select,
  Tag,
  Typography,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { gql, useQuery, useMutation } from "@apollo/client";
import { GET_PIPELINE_STATUSES } from "../apollo/leads";
// Usaremos mutation estándar; el fetch custom de Apollo convierte automáticamente File a upload multipart

export const IMPORT_LEADS_MUTATION = gql`
  mutation ImportContacts(
    $file: Upload!
    $defaultPipelineStatusId: ID
    $tags: [String!]
    $dryRun: Boolean
  ) {
    importContacts(
      file: $file
      defaultPipelineStatusId: $defaultPipelineStatusId
      tags: $tags
      dryRun: $dryRun
    ) {
      totalRows
      imported
      skipped
      duplicates
      errors
      sampleIds
      processingTimeMs
      rowErrors {
        line
        email
        reason
      }
      sampleRows
    }
  }
`;

export default function ImportLeadsModal({
  open,
  onClose,
  result,
  setResult,
  setUploading,
  uploading,
}) {
  const [defaultStage, setDefaultStage] = useState();
  const [tags, setTags] = useState([]);
  const [dryRun, setDryRun] = useState(true);
  const [didImport, setDidImport] = useState(false);
  const { data: pipelineData } = useQuery(GET_PIPELINE_STATUSES, {
    variables: { limit: 100 },
    skip: !open,
  });
  const statuses = useMemo(
    () =>
      (pipelineData?.pipelineStatuses?.edges || []).sort(
        (a, b) => a.order - b.order
      ),
    [pipelineData]
  );
  const [runImport] = useMutation(IMPORT_LEADS_MUTATION);

  const beforeUpload = async (file) => {
    setUploading?.(true);
    setDidImport(false);
    try {
      let uploadFileObj = file;
      if (/\.xlsx?$/i.test(file.name)) {
        try {
          const XLSX = await import("xlsx");
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          uploadFileObj = new File(
            [XLSX.utils.sheet_to_csv(ws)],
            file.name.replace(/\.xlsx?$/i, ".csv"),
            { type: "text/csv" }
          );
        } catch (err) {
          console.warn("XLSX convert fail", err);
        }
      }
      
      const { data } = await runImport({
        variables: {
          file: uploadFileObj,
          defaultPipelineStatusId: defaultStage || null,
          tags,
          dryRun,
        }
      });
      const res = data?.importContacts;
      setResult?.(res || null);
      if (res?.imported) setDidImport(true);
      message.success("Importación completada");
    } catch (e) {
  console.error('Import error:', e);
  message.error(`Error al importar: ${e.message}`);
    } finally {
      setUploading?.(false);
    }
    return false;
  };

  const downloadErrors = () => {
    if (!result?.rowErrors?.length) return;
    const header = "line,email,reason\n";
    const rows = result.rowErrors
      .map((r) => `${r.line},"${r.email}",${r.reason}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import_errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const sampleCsv =
    "email,name,phone\njuan@example.com,Juan Perez,+5215555555555\nana@test.com,Ana Lopez,5554443333";
  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      title="Importar Leads"
      onCancel={() => onClose(didImport)}
      footer={
        <Space>
          <Button onClick={downloadSample}>Ejemplo CSV</Button>
          <Button
            disabled={!result?.rowErrors?.length}
            onClick={downloadErrors}
          >
            Exportar errores
          </Button>
          <Button type="primary" onClick={() => onClose(didImport)}>
            Cerrar
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Select
          allowClear
          placeholder="Etapa por defecto"
          value={defaultStage}
          onChange={(v) => setDefaultStage(v)}
          options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          style={{ width: "100%" }}
        />
        <Select
          mode="tags"
          placeholder="Tags"
          value={tags}
          onChange={(v) => setTags(v)}
          tokenSeparators={[","]}
          style={{ width: "100%" }}
        />
        <Space>
          <Tag
            color={dryRun ? "blue" : "default"}
            style={{ cursor: "pointer" }}
            onClick={() => setDryRun((d) => !d)}
          >
            {dryRun ? "Simulación" : "Real"}
          </Tag>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {dryRun ? "No inserta todavía" : "Creará registros"}
          </Typography.Text>
        </Space>
        <Upload.Dragger
          multiple={false}
          accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.xlsx"
          beforeUpload={beforeUpload}
          disabled={uploading}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? "Procesando..." : "Arrastra CSV/XLSX aquí"}
          </p>
        </Upload.Dragger>
        {result && (
          <Card size="small" title="Resultado">
            <Space direction="vertical" size={2} style={{ fontSize: 12 }}>
              <div>Total filas: {result.totalRows}</div>
              <div>Importados: {result.imported}</div>
              <div>Duplicados: {result.duplicates}</div>
              <div>Saltados: {result.skipped}</div>
              {!!(result.errors || []).length && (
                <div>Errores: {result.errors.join(", ")}</div>
              )}
              {result.processingTimeMs != null && (
                <div>Tiempo: {result.processingTimeMs} ms</div>
              )}
              {!!(result.rowErrors || []).length && (
                <div>
                  Errores filas:{" "}
                  <pre
                    style={{
                      maxHeight: 120,
                      overflow: "auto",
                      background: "#fff1f0",
                      padding: 4,
                    }}
                  >
                    {JSON.stringify(result.rowErrors.slice(0, 10), null, 2)}
                    {result.rowErrors.length > 10 ? "\n..." : ""}
                  </pre>
                </div>
              )}
            </Space>
          </Card>
        )}
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {dryRun
            ? "Ejecuta en modo Real para insertar."
            : didImport
            ? "Se actualizará la lista al cerrar."
            : "Importa un archivo."}
        </Typography.Text>
      </Space>
    </Modal>
  );
}
