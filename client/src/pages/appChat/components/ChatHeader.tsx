import React, { FC } from 'react';
export interface ChatHeaderProps {
	title: string;
}
export const ChatHeader: FC<ChatHeaderProps> = (props: any) => {
	return (
		<div
			style={{
				height:'64px',
				display:'flex',
				alignItems:'center',
				background: 'opacity', // bg-slate-800/50
				// backdropFilter: 'blur(4px)', // backdrop-blur-sm
				// borderBottom: '1px solid rgba(51, 65, 85, 0.5)', // border-b border-slate-700/50
				borderBottom: '1px solid #e6e8ee',
				padding: '16px 12px', // p-6
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div>
					<span
						style={{
							display: 'flex',
							justifyContent: 'center',
							fontSize: '14px',
							fontWeight: 600,
							color: 'rgba(38, 36, 76, 0.65)',
						}}
					>
						应用模板
						<span
							style={{
								display: 'flex',
								justifyContent: 'center',
								fontSize: '14px',
								fontWeight: 400,
								color: 'rgba(38, 36, 76, 0.65)',
								marginInline: '4px',
								paddingInline: '2px',
							}}
						>
							/
						</span>
						{/* <img src='https://gw.alicdn.com/imgextra/i4/O1CN01vVn7g32134zNZEeAR_!!6000000006928-55-tps-24-24.svg'></img> */}
						<span style={{ fontSize: '14px', color: 'rgba(38, 36, 76, 0.88)' }}>{props.title ?? '聊天机器人'}</span>
					</span>
				</div>
			</div>
		</div>
	);
};
