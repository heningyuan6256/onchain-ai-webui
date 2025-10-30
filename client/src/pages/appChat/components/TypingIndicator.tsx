import React from 'react';
import { Bot } from 'lucide-react';
import './Typingdicator.css';
export const TypingIndicator: React.FC = () => {
	return (
		<div className='bubble-loader'>
			<div className='bubble-wrapper'>
				<div className='bubble'>
					<div className='dots'>
						<span className='dot'></span>
						<span className='dot'></span>
						<span className='dot'></span>
					</div>
				</div>
			</div>
		</div>
	);
};
