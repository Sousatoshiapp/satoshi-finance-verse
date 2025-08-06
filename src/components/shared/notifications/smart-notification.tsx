import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface SmartNotificationProps {
  id: string;
  type: 'achievement' | 'progress' | 'warning' | 'celebration';
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position: 'top-right' | 'top-center' | 'bottom-center';
  animation: 'slide' | 'bounce' | 'fade' | 'scale';
  onClose?: () => void;
}

export function SmartNotification({
  id,
  type,
  title,
  description,
  icon,
  action,
  duration = 4000,
  position,
  animation,
  onClose
}: SmartNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'achievement':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          borderColor: 'border-yellow-300',
          textColor: 'text-white'
        };
      case 'celebration':
        return {
          bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
          borderColor: 'border-purple-300',
          textColor: 'text-white'
        };
      case 'progress':
        return {
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          borderColor: 'border-blue-300',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
          borderColor: 'border-orange-300',
          textColor: 'text-white'
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          borderColor: 'border-gray-300',
          textColor: 'text-white'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationVariants = () => {
    switch (animation) {
      case 'slide':
        return {
          initial: { opacity: 0, x: position.includes('right') ? 100 : 0, y: position.includes('top') ? -50 : 50 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: position.includes('right') ? 100 : 0 }
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3, y: -100 },
          animate: { 
            opacity: 1, 
            scale: [0.3, 1.1, 1], 
            y: 0,
            transition: { 
              scale: { times: [0, 0.7, 1], duration: 0.6 },
              type: "spring" as const,
              stiffness: 300,
              damping: 20
            }
          },
          exit: { opacity: 0, scale: 0.8, y: -50 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { 
            opacity: 1, 
            scale: [0, 1.2, 1],
            transition: { 
              scale: { times: [0, 0.5, 1], duration: 0.5 }
            }
          },
          exit: { opacity: 0, scale: 0 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        };
    }
  };

  const config = getTypeConfig();
  const variants = getAnimationVariants();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={id}
          className={`
            fixed z-50 max-w-sm w-full mx-4
            ${getPositionClasses()}
          `}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className={`
            ${config.bgColor} ${config.borderColor} ${config.textColor}
            border-2 rounded-lg shadow-2xl backdrop-blur-sm
            p-4 relative overflow-hidden
          `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative flex items-start gap-3">
              {/* Icon */}
              {icon && (
                <div className="flex-shrink-0">
                  <span className="text-2xl">{icon}</span>
                </div>
              )}

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg leading-tight mb-1">
                  {title}
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {description}
                </p>

                {/* Action Button */}
                {action && (
                  <button
                    onClick={action.onClick}
                    className="
                      mt-3 px-3 py-1 text-xs font-medium
                      bg-white/20 hover:bg-white/30
                      rounded-full transition-colors
                      border border-white/30
                    "
                  >
                    {action.label}
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="
                  flex-shrink-0 p-1 rounded-full
                  hover:bg-white/20 transition-colors
                  opacity-70 hover:opacity-100
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar (for timed notifications) */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SmartNotificationContainer() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    props: Omit<SmartNotificationProps, 'onClose'>;
  }>>([]);

  useEffect(() => {
    const handleShowSmartNotification = (event: CustomEvent) => {
      const notificationData = event.detail;
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== notificationData.id);
        
        return [...filtered, {
          id: notificationData.id,
          props: notificationData
        }];
      });
    };

    window.addEventListener('showSmartNotification', handleShowSmartNotification as EventListener);
    
    return () => {
      window.removeEventListener('showSmartNotification', handleShowSmartNotification as EventListener);
    };
  }, []);

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map(({ id, props }) => (
        <SmartNotification
          key={id}
          {...props}
          onClose={() => handleClose(id)}
        />
      ))}
    </>
  );
}
