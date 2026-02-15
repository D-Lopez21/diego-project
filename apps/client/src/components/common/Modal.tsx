import { type PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '../icons/CloseIcon';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: PropsWithChildren<ModalProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-neutral-800">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-800 cursor-pointer focus:outline-none"
              >
                <CloseIcon className="text-black size-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
