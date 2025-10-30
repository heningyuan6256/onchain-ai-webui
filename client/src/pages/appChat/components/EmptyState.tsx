import React from 'react';
import { List, Typography, Image } from 'antd';
import './empty.css';
// import { ArrowRightOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';
import appsSvg from "../../../assets/image/front-apps.svg";
const { Text, Title } = Typography;
interface EmptyStateProps {
	app: any;
	onSubmit: (msg: any) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ app, onSubmit }) => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				color: '#94a3b8',
				gap: 12,
			}}
		>
			<Icon src={appsSvg} className='w-8 h-8'></Icon>
			{/* <Image width={64} preview={false} src={'/O1CN01kmL1NF1ihPASA19vL_!!6000000004444-2-tps-128-128.avif'} /> */}
			<Title level={3} style={{ margin: 0, fontSize: 16, color: '#26244c' }}>
				{app.app_name}
			</Title>
			<Text style={{ fontSize: 12, color: '#26244CA6', maxWidth: 400 }}>{app.app_reader}</Text>

			<div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
				{app?.app_set_list?.map((item: any, idx: number) => (
					<div
						onClick={() => {
							onSubmit(item);
						}}
						key={idx}
						className='listitem cursor-pointer'
						style={{
							display: 'flex',
							alignItems: 'center',
							padding: '10px 16px',
							border: 'none',
							justifyContent: 'space-between',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<div style={{ width: 20, height: 20, flex: 'none' }}>
								<Image
									width={20}
									height={20}
									preview={false}
									src='https://img.alicdn.com/imgextra/i3/O1CN01822qqr1PVyaK7MYtn_!!6000000001847-2-tps-40-40.png'
									style={{ width: '100%', height: '100%' }} // 填满硬壳即可
								/>
							</div>
							<Text
								style={{
									fontSize: 12,
									color: '#26244c',
									marginLeft: 10,
								}}
							>
								{item}
							</Text>
						</div>
						<div
							style={{
								fontSize: 12,
								color: '#26244c',
								marginLeft: 10,
							}}
						>
							{/* <ArrowRightOutlined /> */}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
