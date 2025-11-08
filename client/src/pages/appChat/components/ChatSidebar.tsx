// ChatSidebar.jsx
import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import './sider.css';
import { useMount } from 'ahooks';
//@ts-ignore
import { CountUp } from 'countup.js';

export const ChatSidebar = (props: any) => {
  const { interactionParams, appDescription, title } = props;
  const dataRef = useRef(null);

  useEffect(() => {
    const countUp = new CountUp(dataRef.current!, Number(interactionParams), {
      duration: 1.0,
    });
    countUp.start();
  }, [interactionParams]);

  return (
    <div className="chat-sidebar">
      {/* <div className='chat-sidebar-header'>
				
			</div> */}

      <div className="chat-sidebar-content">
        {/* <div className='chat-section' style={{ marginBottom: '0px' }}>
					<h3 className='chat-section-title'>应用数据</h3>
					<h2 className='chat-sidebar-title' style={{ marginBottom: '0px' }}>
						<img src='https://gw.alicdn.com/imgextra/i4/O1CN01vVn7g32134zNZEeAR_!!6000000006928-55-tps-24-24.svg'></img>

						<span style={{ fontSize: '16px', color: 'rgba(38, 36, 76, 0.88)' }}>{props.title ?? '应用'}</span>
					</h2>
				</div> */}
        {interactionParams && (
          <>
            <div className="chat-section">
              <h3 className="chat-section-title">应用数据</h3>
              <pre className="chat-section-content">
                <div ref={dataRef}>{interactionParams}</div>
                <div
                  style={{
                    fontFamily: 'BlinkMacSystemFont',
                    color: '#26244CA6',
                    fontSize: '12px',
                    lineHeight: '18px',
                  }}
                >
                  互动次数
                </div>
              </pre>
            </div>

            <hr className="chat-divider" />
          </>
        )}
        {/* <div className='flex flex-col gap-5'></div> */}
        <div className="chat-section">
          <p className="chat-section-description">{appDescription}</p>
        </div>
      </div>
    </div>
  );
};
