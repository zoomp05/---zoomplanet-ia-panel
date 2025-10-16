import React from 'react';
import { Typography, Alert } from 'antd';
import { useParams } from 'react-router';
const { Title } = Typography;
export default () => { const { adId } = useParams(); return (<div><Title level={3}>Detalle Anuncio: {adId}</Title><Alert message="Página en desarrollo" type="info" showIcon /></div>); };
