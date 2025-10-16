import React, { useMemo, useState, Suspense } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Badge, Typography, Tag, Empty, Button, Skeleton, Spin, Avatar, Space, theme, Drawer, Timeline, Input, Tooltip, Select, Divider, Statistic, Row, Col, message } from 'antd';
// Lazy load para reducir bundle inicial
const ImportLeadsModal = React.lazy(() => import('../../components/ImportLeadsModal'));
import { HolderOutlined, MailOutlined, UserOutlined, DragOutlined, SearchOutlined } from '@ant-design/icons';
import { GET_PIPELINE_STATUSES, GET_LEADS, CHANGE_LEAD_PIPELINE } from '../../apollo/leads';
import { gql } from '@apollo/client';

const REORDER_PIPELINE = gql`mutation ReorderPipeline($ids:[ID!]!){ reorderPipelineStatuses(ids:$ids){ id name order } }`;

const LeadsKanban = () => {
  const { data: pipelineData, loading: loadingStatuses } = useQuery(GET_PIPELINE_STATUSES, { variables: { limit: 50 } });
  const leadsQueryVars = { limit: 200, sort:{ field:'CREATED_AT', direction:'DESC' } };
  const { data: leadsData, loading: loadingLeads, refetch: refetchLeads } = useQuery(GET_LEADS, { variables: leadsQueryVars });

  const initialStatuses = useMemo(() => (pipelineData?.pipelineStatuses?.edges || []).sort((a,b)=>a.order-b.order), [pipelineData]);
  const [localStatuses, setLocalStatuses] = useState([]);
  const statuses = localStatuses.length ? localStatuses : initialStatuses;
  const leads = leadsData?.contacts?.edges || [];
  const [changePipeline] = useMutation(CHANGE_LEAD_PIPELINE);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploadingImport, setUploadingImport] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [reorderPipeline] = useMutation(REORDER_PIPELINE);
  const [reordering, setReordering] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [quickSearch, setQuickSearch] = useState(()=> new URLSearchParams(window.location.search).get('q') || '');
  const [qsValue, setQsValue] = useState(()=> new URLSearchParams(window.location.search).get('q') || '');
  // Permisos (heurística): leer de localStorage o global, fallback true
  const userPerms = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem('userPermissions')||'[]'); } catch { return []; }
  },[]);
  const canPipeline = userPerms.includes('crm:pipeline') || userPerms.includes('crm:admin');
  const canReorder = canPipeline; // podría refinarse

  // Local state para agrupación (optimistic)
  // Añadir columna "Sin etapa" si hay leads sin pipelineStatus
  const statusesWithUnassigned = useMemo(()=>{
    const anyUnassigned = leads.some(l=> !l.pipelineStatus);
    if (!anyUnassigned) return statuses;
    const exists = statuses.find(s=>s.id==='__unassigned__');
    if (exists) return statuses;
    return [{ id:'__unassigned__', name:'Sin etapa', order:-1, color:'#999', isFinal:false }, ...statuses];
  },[statuses, leads]);

  const filteredLeads = useMemo(()=>{
    if (!quickSearch) return leads;
    const q = quickSearch.toLowerCase();
    return leads.filter(l => (l.name||'').toLowerCase().includes(q) || (l.email||'').toLowerCase().includes(q));
  },[leads, quickSearch]);

  const grouped = useMemo(() => {
    const base = statusesWithUnassigned.reduce((acc, s) => { acc[s.id] = []; return acc; }, {});
    filteredLeads.forEach(l => {
      const col = l.pipelineStatus?.id || '__unassigned__';
      if (!base[col]) base[col] = []; base[col].push(l);
    });
    return base;
  }, [statusesWithUnassigned, filteredLeads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:4 } }));

  const onDragEnd = async ({ over, active }) => {
    if (!over || !active) return;
    // Column reorder mode
    if (reordering && active.id.startsWith('column:') && over.id.startsWith('column:')){
      if (active.id === over.id) { setActiveColumn(null); return; }
      const activeId = active.id.slice(7);
      const overId = over.id.slice(7);
      const oldIndex = statuses.findIndex(s=>s.id===activeId);
      const newIndex = statuses.findIndex(s=>s.id===overId);
      const newOrder = arrayMove(statuses, oldIndex, newIndex);
      setLocalStatuses(newOrder.map((s,i)=>({ ...s, order:i })));
      setActiveColumn(null);
      try {
        await reorderPipeline({ variables:{ ids: newOrder.map(s=>s.id) }, optimisticResponse:{ reorderPipelineStatuses: newOrder.map((s,i)=>({ __typename:'PipelineStatus', id:s.id, name:s.name, order:i })) } });
      } catch(e){ console.error('Error reordenando pipeline', e); }
      return;
    }
    // Lead drag
    if (!reordering && active.id.startsWith('lead:')){
      const leadId = active.id.replace('lead:','');
      const targetCol = over.id.startsWith('col:') ? over.id.slice(4) : (over.id.startsWith('lead:') ? findColumnOfLead(over.id.slice(5)) : null);
      if (!targetCol) return; // dropped outside
      const lead = leads.find(l => l.id === leadId);
      const currentCol = lead?.pipelineStatus?.id || statuses[0]?.id;
      if (currentCol === targetCol) return;
      try {
        await changePipeline({
          variables: { id: leadId, pipelineStatusId: targetCol },
          optimisticResponse: {
            changeContactPipelineStatus: {
              __typename: 'Contact',
              id: leadId,
              pipelineStatus: { __typename:'PipelineStatus', id: targetCol, name: statuses.find(s=>s.id===targetCol)?.name || '', order: statuses.find(s=>s.id===targetCol)?.order || 0, color: statuses.find(s=>s.id===targetCol)?.color || null }
            }
          },
          update: (cache, { data: mutationData }) => {
            const updated = mutationData?.changeContactPipelineStatus;
            if (!updated || updated.__typename !== 'Contact') return;
            const existing = cache.readQuery({ query: GET_LEADS, variables: { limit: 200, sort:{ field:'CREATED_AT', direction:'DESC' } } });
            if (existing?.contacts?.edges) {
              const newEdges = existing.contacts.edges.map(e => e.id === leadId ? { ...e, pipelineStatus: updated.pipelineStatus } : e);
              cache.writeQuery({ query: GET_LEADS, variables:{ limit:200, sort:{ field:'CREATED_AT', direction:'DESC' } }, data:{ contacts:{ ...existing.contacts, edges:newEdges } } });
            }
          }
        });
      } catch (e) { console.error('Error moving lead', e); }
    }
  };

  const { token } = theme.useToken();
  const loadingAny = (loadingStatuses || loadingLeads) && statuses.length === 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8, flexWrap:'wrap' }}>
        <Typography.Title level={3} style={{ margin:0 }}>Pipeline</Typography.Title>
        <Tooltip title={!canReorder ? 'Sin permiso crm:pipeline' : (reordering? 'Salir de reordenar' : 'Reordenar columnas')}>
          <Button size='small' disabled={!canReorder} onClick={()=> setReordering(r=>!r)} type={reordering?'primary':'default'} icon={<HolderOutlined />}>{reordering ? 'Terminar' : 'Reordenar columnas'}</Button>
        </Tooltip>
  <Input
          size='small'
          allowClear
          placeholder='Buscar lead...'
          prefix={<SearchOutlined />}
          value={qsValue}
          onChange={e=> setQsValue(e.target.value)}
          onPressEnter={()=> setQuickSearch(qsValue)}
          style={{ width:220 }}
        />
  <Button size='small' onClick={()=>{ setQuickSearch(qsValue); const params = new URLSearchParams(window.location.search); if(qsValue) params.set('q',qsValue); else params.delete('q'); const newUrl = window.location.pathname + '?' + params.toString(); window.history.replaceState(null,'',newUrl); }} disabled={qsValue===quickSearch}>Filtrar</Button>
  <Button size='small' type='dashed' onClick={()=> setImportModalOpen(true)}>Importar Leads</Button>
        {importResult?.rowErrors?.length > 0 && <Tag color='red'>Errores ({importResult.rowErrors.length})</Tag>}
        {quickSearch && <Tag color='blue' closable onClose={()=>{ setQuickSearch(''); setQsValue(''); }}>Filtro: {quickSearch}</Tag>}
      </div>
      {loadingAny && <Spin style={{ margin:'16px auto' }} />}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd} onDragStart={({active})=>{ if(reordering && active.id.startsWith('column:')) setActiveColumn(active.id.slice(7)); }}>
    <SortableContext items={statusesWithUnassigned.map(s=>`column:${s.id}`)} strategy={horizontalListSortingStrategy} disabled={!reordering}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', overflowX:'auto', padding:'4px 4px 12px 4px' }}>
            {statusesWithUnassigned.map(s => {
              const items = (grouped[s.id]||[]);
              const totalLeads = filteredLeads.length || 1;
              const percent = ((items.length / totalLeads) * 100).toFixed(0);
              return (
                <SortableColumn key={s.id} id={s.id} disabled={!reordering}>
                  <Card
                    id={`col:${s.id}`}
                    size="small"
                    title={<ColumnTitle name={s.name} count={items.length} percent={percent} color={s.color} dragging={reordering && activeColumn===s.id} reordering={reordering} />}
                    style={{ minWidth:280, background: token.colorFillAlter, borderColor: s.color || token.colorBorderSecondary, opacity: reordering && activeColumn===s.id ? 0.55 : 1, cursor: reordering ? 'grab':'default' }}
                    headStyle={{ background: s.color ? s.color+'14' : token.colorBgContainer, borderRadius:6, padding:'8px 12px' }}
                    bodyStyle={{ padding:8, minHeight:140, display:'flex', flexDirection:'column', gap:8 }}
                  >
          <SortableContext items={items.map(l=>`lead:${l.id}`)} strategy={verticalListSortingStrategy} disabled={reordering || !canPipeline}>
                      <div style={{ display:'flex', flexDirection:'column', gap:8, minHeight:40 }}>
                        {(!reordering && items.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />}
                        {loadingAny && <Skeleton active title={false} paragraph={{ rows:3, width:'100%' }} />}
            {!reordering && !loadingAny && items.map(l => <SortableLeadCard key={l.id} lead={l} statusColor={s.color} onSelect={setSelectedLead} disableDrag={!canPipeline} />)}
                      </div>
                    </SortableContext>
                  </Card>
                </SortableColumn>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <Typography.Paragraph style={{ marginTop:12, fontSize:12, color:token.colorTextTertiary }}>Arrastra un lead a otra columna para cambiar su etapa.</Typography.Paragraph>
      {reordering && <Typography.Paragraph style={{ fontSize:12, color:token.colorWarning }}>Modo reordenar columnas activo: arrastra los encabezados.</Typography.Paragraph>}
    {!canPipeline && <Typography.Paragraph style={{ fontSize:12, color:token.colorError }}>No tienes permiso para mover leads (crm:pipeline requerido).</Typography.Paragraph>}

  <LeadDrawer lead={selectedLead} onClose={()=> setSelectedLead(null)} />
  <Suspense fallback={null}>
    <ImportLeadsModal open={importModalOpen} onClose={(didImport)=>{ setImportModalOpen(false); if (didImport) refetchLeads(); /* conservar importResult para mostrar badge */ }} result={importResult} setResult={setImportResult} setUploading={setUploadingImport} uploading={uploadingImport} />
  </Suspense>
    </div>
  );
};

function ColumnTitle({ name, count, percent, color, dragging, reordering }){
  return (
    <Space size={6} style={{ display:'flex', width:'100%', alignItems:'center' }}>
      {reordering && <HolderOutlined style={{ cursor:'grab', color: dragging ? '#fa541c' : '#999' }} />}
      <Badge color={color || 'blue'} text={<Typography.Text strong>{name}</Typography.Text>} />
  <Tag color={color || 'default'} style={{ marginLeft:'auto' }}>{count}</Tag>
  <Typography.Text type='secondary' style={{ fontSize:11 }}>{percent}%</Typography.Text>
      {reordering && <Tag color={dragging ? 'red':'processing'} style={{ marginLeft:4 }}>{dragging?'Moviendo':'Mover'}</Tag>}
    </Space>
  );
}

function SortableColumn({ id, children, disabled }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id:`column:${id}`, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display:'flex'
  };
  return <div ref={setNodeRef} style={style} {...(!disabled ? { ...attributes, ...listeners } : {})}>{children}</div>;
}

function SortableLeadCard({ lead, statusColor, onSelect, disableDrag }){
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id:`lead:${lead.id}`, disabled: disableDrag });
  const borderClr = statusColor || '#d9d9d9';
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.12)',
    cursor:'grab'
  };
  return (
    <Card ref={setNodeRef}
      size='small'
      style={{ ...style, borderLeft:`4px solid ${borderClr}`, padding:4 }}
      bodyStyle={{ padding:8 }}
      {...(!disableDrag ? { ...attributes, ...listeners } : {})}
      onClick={(e)=>{ // evitar que drag handle haga click
        if (e.target.closest('.lead-drag-handle')) return;
        onSelect?.(lead);
      }}
    >
      <Space direction='vertical' size={2} style={{ width:'100%' }}>
        <Space size={6} align='center'>
          <Tooltip title={disableDrag ? 'Sin permiso para arrastrar' : 'Arrastrar lead'}>
            <DragOutlined className='lead-drag-handle' style={{ fontSize:14, color:disableDrag?'#bbb':'#666', cursor: disableDrag ? 'not-allowed':'grab' }} {...(!disableDrag ? listeners : {})} {...(!disableDrag ? attributes : {})} />
          </Tooltip>
          <Avatar size={22} icon={lead.name ? <UserOutlined /> : <MailOutlined />} style={{ backgroundColor: borderClr || '#1677ff' }} />
          <Typography.Text strong ellipsis style={{ maxWidth:150 }}>{lead.name || lead.email}</Typography.Text>
        </Space>
        <Typography.Text type='secondary' style={{ fontSize:12 }}>{lead.email}</Typography.Text>
        {lead.pipelineStatus?.name && <Tag color={lead.pipelineStatus.color || 'blue'} style={{ marginTop:4 }}>{lead.pipelineStatus.name}</Tag>}
      </Space>
    </Card>
  );
}

function LeadDrawer({ lead, onClose }){
  const { token } = theme.useToken();
  const [changing, setChanging] = useState(false);
  const [selectedStage, setSelectedStage] = useState(lead?.pipelineStatus?.id);
  const [note, setNote] = useState('');
  const { data: pipelineData } = useQuery(GET_PIPELINE_STATUSES, { variables: { limit:50 } });
  const statuses = useMemo(()=> (pipelineData?.pipelineStatuses?.edges || []).sort((a,b)=>a.order-b.order), [pipelineData]);
  const [changePipeline] = useMutation(CHANGE_LEAD_PIPELINE);

  const applyChange = async () => {
    if (!lead || !selectedStage || selectedStage === lead.pipelineStatus?.id) return;
    setChanging(true);
    try {
      await changePipeline({
        variables: { id: lead.id, pipelineStatusId: selectedStage, note },
        optimisticResponse: {
          changeContactPipelineStatus: { __typename:'Contact', id: lead.id, pipelineStatus: { __typename:'PipelineStatus', id: selectedStage, name: statuses.find(s=>s.id===selectedStage)?.name || '', order:0, color: statuses.find(s=>s.id===selectedStage)?.color || null } }
        },
        update: (cache,{ data }) => {
          const updated = data?.changeContactPipelineStatus;
          if (!updated || updated.__typename !== 'Contact') return;
          // Actualizar lista de leads
          const vars = { limit:200, sort:{ field:'CREATED_AT', direction:'DESC' } };
          const existing = cache.readQuery({ query: GET_LEADS, variables: vars });
          if (existing?.contacts?.edges){
            const newEdges = existing.contacts.edges.map(e => e.id === lead.id ? { ...e, pipelineStatus: updated.pipelineStatus, statusHistory: updated.statusHistory } : e);
            cache.writeQuery({ query: GET_LEADS, variables: vars, data:{ contacts:{ ...existing.contacts, edges:newEdges } } });
          }
        }
      });
      message.success('Etapa actualizada');
      setNote('');
    } catch(e){ message.error('Error al actualizar'); }
    finally { setChanging(false); }
  };

  return (
    <Drawer width={420} open={!!lead} onClose={onClose} title={lead ? (lead.name || lead.email) : ''} destroyOnClose>
      {!lead && <Empty />}
      {lead && (
        <Space direction='vertical' style={{ width:'100%' }} size='large'>
          <Row gutter={12}>
            <Col span={24}>
              <Space direction='vertical' size={2} style={{ width:'100%' }}>
                <Typography.Text type='secondary'>Email</Typography.Text>
                <Typography.Text copyable>{lead.email}</Typography.Text>
              </Space>
            </Col>
          </Row>
          <Divider style={{ margin:'8px 0' }}>Etapa</Divider>
            <Space direction='vertical' size={4} style={{ width:'100%' }}>
              <Select
                value={selectedStage}
                placeholder='Selecciona etapa'
                onChange={v=> setSelectedStage(v)}
                options={statuses.map(s=> ({ label:s.name, value:s.id }))}
                style={{ width:'100%' }}
              />
              <Input.TextArea value={note} onChange={e=>setNote(e.target.value)} placeholder='Nota (opcional)' rows={2} maxLength={160} />
              <Button type='primary' size='small' loading={changing} disabled={!selectedStage || selectedStage === lead.pipelineStatus?.id} onClick={applyChange}>Actualizar etapa</Button>
              {lead.pipelineStatus?.name && <Tag color={lead.pipelineStatus.color || 'blue'} style={{ alignSelf:'flex-start' }}>{lead.pipelineStatus.name}</Tag>}
            </Space>
          <Divider style={{ margin:'8px 0' }}>Historial</Divider>
          <Space direction='vertical' size={4} style={{ width:'100%' }}>
            <Timeline
              items={(lead.statusHistory || []).slice().sort((a,b)=> new Date(b.changedAt)-new Date(a.changedAt)).map(entry => ({
                color: entry.status?.color || 'blue',
                children: (
                  <div>
                    <Typography.Text>{entry.status?.name || 'Desconocido'}</Typography.Text>
                    <div style={{ fontSize:11, color: token.colorTextTertiary }}>
                      {new Date(entry.changedAt).toLocaleString()}{entry.note? ' · '+entry.note: ''}
                    </div>
                  </div>
                )
              }))}
            />
          </Space>
          <Divider style={{ margin:'8px 0' }}>Métricas</Divider>
          <Row gutter={12}>
            <Col span={12}><Statistic title='Score' value={lead.score || 0} /></Col>
            <Col span={12}><Statistic title='Actividades' value={lead.statusHistory?.length || 0} /></Col>
          </Row>
          <Row gutter={12} style={{ marginTop:8 }}>
            <Col span={12}><Statistic title='Generado' value={lead.generatedAt ? new Date(lead.generatedAt).toLocaleDateString() : '-'} /></Col>
            <Col span={12}><Statistic title='Tiempo en etapa (h)' value={lead.timeInCurrentStageMs ? (lead.timeInCurrentStageMs/3600000).toFixed(1) : '-'} /></Col>
          </Row>
          <Divider style={{ margin:'8px 0' }}>Próximamente</Divider>
          <Empty description='Actividades / tareas' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Space>
      )}
    </Drawer>
  );
}

function findColumnOfLead(){ /* placeholder; DnD over lead uses parent column via container */ }

export default LeadsKanban;
