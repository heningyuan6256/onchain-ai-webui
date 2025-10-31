import React, { forwardRef } from 'react';
import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { SendIcon, TooltipAnchor } from '@librechat/client';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import Icon from '~/components/icon';
import ARROWSVG from '@/assets/image/front-arrow.svg';

type SendButtonProps = {
  disabled: boolean;
  control: Control<{ text: string }>;
};

const SubmitButton = React.memo(
  forwardRef((props: { disabled: boolean }, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const localize = useLocalize();
    return (
      <TooltipAnchor
        description={localize('com_nav_send_message')}
        render={
          <button
            ref={ref}
            aria-label={localize('com_nav_send_message')}
            id="send-button"
            disabled={props.disabled}
            className={cn(
              'rounded-full size-6 bg-text-primary flex items-center justify-center text-text-primary outline-offset-4 transition-all duration-200 disabled:cursor-not-allowed disabled:text-text-secondary disabled:opacity-10',
            )}
            data-testid="send-button"
            type="submit"
          >
            <span className="" data-state="closed">
              <Icon className='w-4 h-4 rotate-180' src={ARROWSVG} />
              {/* <Button
                          size='icon'
                          className='bg-[#0563B2] h-[24px] w-[24px] rounded-[50%] p-0 cursor-pointer'
                          onClick={handleSend}
                          disabled={!inputMessage || uploadedImages.length === 0}
                        >
                          <Icon className='w-4 h-4 rotate-180' src={ARROWSVG} />
                        </Button> */}
              {/* <SendIcon size={24} />
              <Send size={20} /> */}
            </span>
          </button>
        }
      />
    );
  }),
);

const SendButton = React.memo(
  forwardRef((props: SendButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const data = useWatch({ control: props.control });
    return <SubmitButton ref={ref} disabled={props.disabled || !data.text} />;
  }),
);

export default SendButton;
