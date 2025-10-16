import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Table, Form, Input, Select, Button, Tag, Space, Typography } from 'antd';
import { Drawer } from 'antd';
const ImportLeadsModal = React.lazy(() => import('../../components/ImportLeadsModal'));
import { GET_LEADS, GET_PIPELINE_STATUSES, CHANGE_LEAD_PIPELINE, CONTACT_STATUS_OPTIONS } from '../../apollo/leads';
import toast from 'react-hot-toast';

const LeadsList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pipeline, setPipeline] = useState('');
  const { data: statusData } = useQuery(GET_PIPELINE_STATUSES, { variables: { limit: 50 } });
  const pipelineStatuses = useMemo(()=> (statusData?.pipelineStatuses?.edges || []).sort((a,b)=>a.order-b.order), [statusData]);

  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState({ field: 'CREATED_AT', direction: 'DESC' });
  const { data, loading, refetch } = useQuery(GET_LEADS, { variables: { limit, offset, filter: buildFilter(search,status,pipeline), sort } });
  const [changePipeline] = useMutation(CHANGE_LEAD_PIPELINE);
  const leads = data?.contacts?.edges || [];

  const onChangePipeline = async (leadId, pipelineStatusId) => {
    try {
      await changePipeline({
        variables: { id: leadId, pipelineStatusId },
        optimisticResponse: {
          changeContactPipelineStatus: { __typename: 'Contact', id: leadId, pipelineStatus: { __typename:'PipelineStatus', id: pipelineStatusId, name: pipelineStatuses.find(p=>p.id===pipelineStatusId)?.name || '', order:0, color:null } }
        },
        update: (cache, { data: mutationData }) => {
          const updated = mutationData?.changeContactPipelineStatus;
          if (!updated || updated.__typename !== 'Contact') return;
          const existing = cache.readQuery({ query: GET_LEADS, variables: { limit:25, offset:0, filter: buildFilter(search,status,pipeline), sort } });
          if (existing?.contacts?.edges) {
            cache.writeQuery({ query: GET_LEADS, variables:{ limit:25, offset:0, filter: buildFilter(search,status,pipeline), sort }, data: { contacts: { ...existing.contacts, edges: existing.contacts.edges.map(e => e.id === leadId ? { ...e, pipelineStatus: updated.pipelineStatus } : e) } } });
          }
        }
      });
      toast.success('Etapa actualizada');
    } catch (e) { toast.error('Error al cambiar etapa'); }
  };

  const onSubmitFilter = (e) => { e.preventDefault(); setOffset(0); refetch({ limit, offset:0, filter: buildFilter(search,status,pipeline), sort }); };

  const pageInfo = data?.contacts?.pageInfo;
  const totalCount = data?.contacts?.totalCount || 0;
  const nextPage = () => { if(pageInfo?.hasNextPage){ const newOffset = offset + limit; setOffset(newOffset); refetch({ limit, offset:newOffset, filter: buildFilter(search,status,pipeline), sort }); } };
  const prevPage = () => { if(pageInfo?.hasPreviousPage){ const newOffset = Math.max(0, offset - limit); setOffset(newOffset); refetch({ limit, offset:newOffset, filter: buildFilter(search,status,pipeline), sort }); } };

  const onTableChange = (pagination, filters, sorter) => {
    if (sorter?.field) {
      const mapping = {
        createdAt: 'CREATED_AT',
        name: 'NAME',
        email: 'EMAIL'
      };
      const fieldKey = mapping[sorter.field] || 'CREATED_AT';
      const direction = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      const newSort = { field: fieldKey, direction };
      setSort(newSort);
      setOffset(0);
      refetch({ limit, offset:0, filter: buildFilter(search,status,pipeline), sort: newSort });
    }
  };

  const [selectedLead, setSelectedLead] = useState(null);
  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: true, sortOrder: sort.field==='NAME' ? (sort.direction==='ASC'?'ascend':'descend'):undefined, render:(v, r)=> v || <Typography.Text type='secondary'>-</Typography.Text> },
    { title: 'WhatsApp', dataIndex: 'whatsapp', key: 'whatsapp', render:(v)=> v ? <a href={`https://wa.me/${v}`} target='_blank' rel='noopener noreferrer'>{v}</a> : <Typography.Text type='secondary'>-</Typography.Text> },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true, sortOrder: sort.field==='EMAIL' ? (sort.direction==='ASC'?'ascend':'descend'):undefined },
    { title: 'Tipo', dataIndex: 'type', key: 'type', filters: [...new Set(leads.map(l=>l.type))].map(t=>({ text:t, value:t })), onFilter:(val,rec)=>rec.type===val },
    { title: 'Status', dataIndex: 'status', key: 'status', filters: CONTACT_STATUS_OPTIONS.map(s=>({ text:s, value:s })), onFilter:(val,rec)=>rec.status===val, render: s => <Tag color={statusColor(s)}>{s}</Tag> },
    { title: 'Pipeline', dataIndex: ['pipelineStatus','name'], key: 'pipeline', render: (_,r) => (
      <Select size='small' style={{ minWidth:140 }} value={r.pipelineStatus?.id || undefined} onChange={val=> onChangePipeline(r.id, val)}>
        <Select.Option value={undefined}>-</Select.Option>
        {pipelineStatuses.map(p=> <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
      </Select>
    ) },
    { title: 'Creado', dataIndex: 'createdAt', key: 'createdAt', sorter: true, sortOrder: sort.field==='CREATED_AT' ? (sort.direction==='ASC'?'ascend':'descend'):undefined, render: d=> new Date(d).toLocaleDateString() },
    { title: 'Generado', dataIndex: 'generatedAt', key: 'generatedAt', render: d=> d ? new Date(d).toLocaleDateString() : '-' },
    { title: 'Horas en etapa', dataIndex: 'timeInCurrentStageMs', key: 'timeInCurrentStageMs', render: v=> v ? (v/3600000).toFixed(1) : '-' }
  ];

  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importUploading, setImportUploading] = useState(false);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop:0 }}>Leads - Lista</Typography.Title>
      <Form layout='inline' onFinish={onSubmitFilter} style={{ marginBottom:12 }}>
        <Form.Item>
          <Input placeholder='Buscar' value={search} onChange={e=>setSearch(e.target.value)} allowClear />
        </Form.Item>
        <Form.Item>
          <Select placeholder='Status' value={status || undefined} onChange={v=>setStatus(v||'')} allowClear style={{ width:140 }}>
            {CONTACT_STATUS_OPTIONS.map(s=> <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item>
          <Select placeholder='Pipeline' value={pipeline || undefined} onChange={v=>setPipeline(v||'')} allowClear style={{ width:160 }}>
            {pipelineStatuses.map(p=> <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type='primary' htmlType='submit'>Filtrar</Button>
            <Button onClick={()=>{ setSearch(''); setStatus(''); setPipeline(''); setOffset(0); refetch({ limit, offset:0, filter:{}, sort }); }}>Limpiar</Button>
            <Button type='dashed' onClick={()=> setImportOpen(true)}>Importar</Button>
            {importResult?.rowErrors?.length > 0 && <Tag color='red'>Errores ({importResult.rowErrors.length})</Tag>}
          </Space>
        </Form.Item>
      </Form>
  <Table
        size='small'
        loading={loading}
        dataSource={leads.map(l=> ({ key:l.id, ...l }))}
        columns={columns}
        onChange={onTableChange}
        pagination={{
          current: Math.floor(offset/limit)+1,
          pageSize: limit,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ['10','25','50','100'],
          onChange:(page,pageSize)=>{
            const newOffset = (page-1)*pageSize;
            setLimit(pageSize); setOffset(newOffset);
            refetch({ limit:pageSize, offset:newOffset, filter: buildFilter(search,status,pipeline), sort });
          }
        }}
        onRow={record => ({
          onClick: () => setSelectedLead(record)
        })}
      />
  {/* Drawer lateral para vista de lead */}
  <Drawer
    title={<Typography.Title level={4} style={{margin:0}}>Detalle Lead</Typography.Title>}
    placement="right"
    open={!!selectedLead}
    onClose={()=>setSelectedLead(null)}
    width={600}
    size="large"
  >
    {selectedLead && (
      <div>
        <div><b>Nombre:</b> {selectedLead.name}</div>
        <div><b>Email:</b> {selectedLead.email || '-'}</div>
        <div><b>WhatsApp:</b> {selectedLead.whatsapp || '-'}</div>
        <div><b>Teléfono:</b> {selectedLead.phone || '-'}</div>
        <div><b>Status:</b> {selectedLead.status}</div>
        <div><b>Pipeline:</b> {selectedLead.pipelineStatus?.name || '-'}</div>
        <div><b>Creado:</b> {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : '-'}</div>
        <div><b>Generado:</b> {selectedLead.generatedAt ? new Date(selectedLead.generatedAt).toLocaleString() : '-'}</div>
        {/* Puedes agregar más campos aquí */}
      </div>
    )}
  </Drawer>
  <Typography.Paragraph style={{ fontSize:12, color:'#888', marginTop:8 }}>Orden: {sort.field} {sort.direction}</Typography.Paragraph>
  <Suspense fallback={null}>
    <ImportLeadsModal open={importOpen} onClose={(didImport)=>{ setImportOpen(false); if(didImport){ refetch({ limit, offset:0, filter: buildFilter(search,status,pipeline), sort }); } }} result={importResult} setResult={setImportResult} setUploading={setImportUploading} uploading={importUploading} />
  </Suspense>
    </div>
  );
};

function statusColor(s){
  switch(s){
    case 'ACTIVE': return 'green';
    case 'UNSUBSCRIBED': return 'orange';
    case 'BOUNCED': return 'red';
    case 'COMPLAINED': return 'magenta';
    case 'ARCHIVED': return 'geekblue';
    default: return 'blue';
  }
}

function buildFilter(search,status,pipeline){
  const f = {};
  if (search) f.search = search;
  if (status) f.status = status;
  if (pipeline) f.pipelineStatusId = pipeline;
  return f;
}

// sort client-side eliminado (server-side)

export default LeadsList;

// Reutilizar mismo modal usado en Kanban (se importa dinámica aquí para evitar duplicar lógica)
