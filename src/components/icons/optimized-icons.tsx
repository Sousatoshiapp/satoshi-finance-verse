import { memo, lazy, Suspense } from 'react';
import type { LucideProps } from 'lucide-react';

// Core icons - bundled with main chunk (most frequently used)
export { 
  ArrowLeft, Trophy, Users, Star, Crown, Medal, Zap, Target, 
  TrendingUp, BookOpen, Settings, Search, Plus, Minus, X,
  Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Home, User, Heart, Share, MessageCircle, Bell, Menu,
  Sparkles, Gamepad2, Filter, Clock, Calendar, Award,
  Activity, DollarSign, BarChart3, Brain, Upload, Edit,
  Copy, Download, Save, RefreshCw, Play, Pause, Volume2,
  Wifi, Globe, MapPin, Car, Building, ShoppingCart, Gift,
  Timer, Sun, Moon, Palette, Code, Database, Wrench,
  Shield, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

const iconMap = {
  TrendingDown: lazy(() => import('lucide-react').then(m => ({ default: m.TrendingDown }))),
  PieChart: lazy(() => import('lucide-react').then(m => ({ default: m.PieChart }))),
  MessageSquare: lazy(() => import('lucide-react').then(m => ({ default: m.MessageSquare }))),
  ThumbsUp: lazy(() => import('lucide-react').then(m => ({ default: m.ThumbsUp }))),
  ThumbsDown: lazy(() => import('lucide-react').then(m => ({ default: m.ThumbsDown }))),
  Flag: lazy(() => import('lucide-react').then(m => ({ default: m.Flag }))),
  Trash2: lazy(() => import('lucide-react').then(m => ({ default: m.Trash2 }))),
  ExternalLink: lazy(() => import('lucide-react').then(m => ({ default: m.ExternalLink }))),
  Link: lazy(() => import('lucide-react').then(m => ({ default: m.Link }))),
  Image: lazy(() => import('lucide-react').then(m => ({ default: m.Image }))),
  Video: lazy(() => import('lucide-react').then(m => ({ default: m.Video }))),
  Music: lazy(() => import('lucide-react').then(m => ({ default: m.Music }))),
  File: lazy(() => import('lucide-react').then(m => ({ default: m.File }))),
  Folder: lazy(() => import('lucide-react').then(m => ({ default: m.Folder }))),
  RotateCcw: lazy(() => import('lucide-react').then(m => ({ default: m.RotateCcw }))),
  RotateCw: lazy(() => import('lucide-react').then(m => ({ default: m.RotateCw }))),
  Maximize: lazy(() => import('lucide-react').then(m => ({ default: m.Maximize }))),
  Minimize: lazy(() => import('lucide-react').then(m => ({ default: m.Minimize }))),
  VolumeX: lazy(() => import('lucide-react').then(m => ({ default: m.VolumeX }))),
  Square: lazy(() => import('lucide-react').then(m => ({ default: m.Square }))),
  SkipBack: lazy(() => import('lucide-react').then(m => ({ default: m.SkipBack }))),
  SkipForward: lazy(() => import('lucide-react').then(m => ({ default: m.SkipForward }))),
  WifiOff: lazy(() => import('lucide-react').then(m => ({ default: m.WifiOff }))),
  Bluetooth: lazy(() => import('lucide-react').then(m => ({ default: m.Bluetooth }))),
  Battery: lazy(() => import('lucide-react').then(m => ({ default: m.Battery }))),
  Smartphone: lazy(() => import('lucide-react').then(m => ({ default: m.Smartphone }))),
  Laptop: lazy(() => import('lucide-react').then(m => ({ default: m.Laptop }))),
  Monitor: lazy(() => import('lucide-react').then(m => ({ default: m.Monitor }))),
  Camera: lazy(() => import('lucide-react').then(m => ({ default: m.Camera }))),
  Mic: lazy(() => import('lucide-react').then(m => ({ default: m.Mic }))),
  MicOff: lazy(() => import('lucide-react').then(m => ({ default: m.MicOff }))),
  Headphones: lazy(() => import('lucide-react').then(m => ({ default: m.Headphones }))),
  Navigation: lazy(() => import('lucide-react').then(m => ({ default: m.Navigation }))),
  Compass: lazy(() => import('lucide-react').then(m => ({ default: m.Compass }))),
  Map: lazy(() => import('lucide-react').then(m => ({ default: m.Map }))),
  Plane: lazy(() => import('lucide-react').then(m => ({ default: m.Plane }))),
  Bike: lazy(() => import('lucide-react').then(m => ({ default: m.Bike }))),
  Train: lazy(() => import('lucide-react').then(m => ({ default: m.Train }))),
  Bus: lazy(() => import('lucide-react').then(m => ({ default: m.Bus }))),
  Ship: lazy(() => import('lucide-react').then(m => ({ default: m.Ship }))),
  Rocket: lazy(() => import('lucide-react').then(m => ({ default: m.Rocket }))),
  Building2: lazy(() => import('lucide-react').then(m => ({ default: m.Building2 }))),
  Store: lazy(() => import('lucide-react').then(m => ({ default: m.Store }))),
  ShoppingBag: lazy(() => import('lucide-react').then(m => ({ default: m.ShoppingBag }))),
  CreditCard: lazy(() => import('lucide-react').then(m => ({ default: m.CreditCard }))),
  Banknote: lazy(() => import('lucide-react').then(m => ({ default: m.Banknote }))),
  Coins: lazy(() => import('lucide-react').then(m => ({ default: m.Coins }))),
  PiggyBank: lazy(() => import('lucide-react').then(m => ({ default: m.PiggyBank }))),
  Wallet: lazy(() => import('lucide-react').then(m => ({ default: m.Wallet }))),
  Package: lazy(() => import('lucide-react').then(m => ({ default: m.Package }))),
  Truck: lazy(() => import('lucide-react').then(m => ({ default: m.Truck }))),
  Timer: lazy(() => import('lucide-react').then(m => ({ default: m.Timer }))),
  AlarmClock: lazy(() => import('lucide-react').then(m => ({ default: m.AlarmClock }))),
  Cloud: lazy(() => import('lucide-react').then(m => ({ default: m.Cloud }))),
  CloudRain: lazy(() => import('lucide-react').then(m => ({ default: m.CloudRain }))),
  CloudSnow: lazy(() => import('lucide-react').then(m => ({ default: m.CloudSnow }))),
  Flame: lazy(() => import('lucide-react').then(m => ({ default: m.Flame }))),
  Droplets: lazy(() => import('lucide-react').then(m => ({ default: m.Droplets }))),
  Thermometer: lazy(() => import('lucide-react').then(m => ({ default: m.Thermometer }))),
  Wind: lazy(() => import('lucide-react').then(m => ({ default: m.Wind }))),
  Snowflake: lazy(() => import('lucide-react').then(m => ({ default: m.Snowflake }))),
  Umbrella: lazy(() => import('lucide-react').then(m => ({ default: m.Umbrella }))),
  Brush: lazy(() => import('lucide-react').then(m => ({ default: m.Brush }))),
  Pen: lazy(() => import('lucide-react').then(m => ({ default: m.Pen }))),
  PenTool: lazy(() => import('lucide-react').then(m => ({ default: m.PenTool }))),
  Eraser: lazy(() => import('lucide-react').then(m => ({ default: m.Eraser }))),
  Scissors: lazy(() => import('lucide-react').then(m => ({ default: m.Scissors }))),
  Ruler: lazy(() => import('lucide-react').then(m => ({ default: m.Ruler }))),
  Calculator: lazy(() => import('lucide-react').then(m => ({ default: m.Calculator }))),
  Code2: lazy(() => import('lucide-react').then(m => ({ default: m.Code2 }))),
  Terminal: lazy(() => import('lucide-react').then(m => ({ default: m.Terminal }))),
  Server: lazy(() => import('lucide-react').then(m => ({ default: m.Server }))),
  HardDrive: lazy(() => import('lucide-react').then(m => ({ default: m.HardDrive }))),
  Cpu: lazy(() => import('lucide-react').then(m => ({ default: m.Cpu }))),
  MemoryStick: lazy(() => import('lucide-react').then(m => ({ default: m.MemoryStick }))),
  CircuitBoard: lazy(() => import('lucide-react').then(m => ({ default: m.CircuitBoard }))),
  Hammer: lazy(() => import('lucide-react').then(m => ({ default: m.Hammer }))),
  Wrench: lazy(() => import('lucide-react').then(m => ({ default: m.Wrench }))),
  Drill: lazy(() => import('lucide-react').then(m => ({ default: m.Drill }))),
  Pickaxe: lazy(() => import('lucide-react').then(m => ({ default: m.Pickaxe }))),
  Shovel: lazy(() => import('lucide-react').then(m => ({ default: m.Shovel }))),
  Swords: lazy(() => import('lucide-react').then(m => ({ default: m.Swords }))),
  Sword: lazy(() => import('lucide-react').then(m => ({ default: m.Sword }))),
  Crosshair: lazy(() => import('lucide-react').then(m => ({ default: m.Crosshair }))),
  Pulse: lazy(() => import('lucide-react').then(m => ({ default: m.Activity }))),
  Lightbulb: lazy(() => import('lucide-react').then(m => ({ default: m.Lightbulb }))),
  GraduationCap: lazy(() => import('lucide-react').then(m => ({ default: m.GraduationCap }))),
  School: lazy(() => import('lucide-react').then(m => ({ default: m.School }))),
  Library: lazy(() => import('lucide-react').then(m => ({ default: m.Library }))),
  Bookmark: lazy(() => import('lucide-react').then(m => ({ default: m.Bookmark }))),
  BookmarkPlus: lazy(() => import('lucide-react').then(m => ({ default: m.BookmarkPlus }))),
  Book: lazy(() => import('lucide-react').then(m => ({ default: m.Book }))),
  Newspaper: lazy(() => import('lucide-react').then(m => ({ default: m.Newspaper }))),
  FileText: lazy(() => import('lucide-react').then(m => ({ default: m.FileText }))),
  Scroll: lazy(() => import('lucide-react').then(m => ({ default: m.Scroll }))),
  Mail: lazy(() => import('lucide-react').then(m => ({ default: m.Mail }))),
  MailOpen: lazy(() => import('lucide-react').then(m => ({ default: m.MailOpen }))),
  Send: lazy(() => import('lucide-react').then(m => ({ default: m.Send }))),
  Inbox: lazy(() => import('lucide-react').then(m => ({ default: m.Inbox }))),
  Archive: lazy(() => import('lucide-react').then(m => ({ default: m.Archive }))),
  Trash: lazy(() => import('lucide-react').then(m => ({ default: m.Trash }))),
  UserPlus: lazy(() => import('lucide-react').then(m => ({ default: m.UserPlus }))),
  UserMinus: lazy(() => import('lucide-react').then(m => ({ default: m.UserMinus }))),
  UserCheck: lazy(() => import('lucide-react').then(m => ({ default: m.UserCheck }))),
  UserX: lazy(() => import('lucide-react').then(m => ({ default: m.UserX }))),
  Users2: lazy(() => import('lucide-react').then(m => ({ default: m.Users2 }))),
  UserCog: lazy(() => import('lucide-react').then(m => ({ default: m.UserCog }))),
  Handshake: lazy(() => import('lucide-react').then(m => ({ default: m.Handshake }))),
  Smile: lazy(() => import('lucide-react').then(m => ({ default: m.Smile }))),
  Frown: lazy(() => import('lucide-react').then(m => ({ default: m.Frown }))),
  Meh: lazy(() => import('lucide-react').then(m => ({ default: m.Meh }))),
  Laugh: lazy(() => import('lucide-react').then(m => ({ default: m.Laugh }))),
  Key: lazy(() => import('lucide-react').then(m => ({ default: m.Key }))),
};

export const LazyIcon = memo(({ name, fallback, ...props }: { 
  name: keyof typeof iconMap; 
  fallback?: React.ReactNode;
} & Omit<LucideProps, 'ref'>) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return fallback || <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />;
  }
  
  return (
    <Suspense fallback={fallback || <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />}>
      <IconComponent {...props} />
    </Suspense>
  );
});

export const preloadCriticalIcons = () => {
  return Promise.all([
    import('lucide-react').then(m => m.Sparkles),
    import('lucide-react').then(m => m.Trophy),
    import('lucide-react').then(m => m.Target),
    import('lucide-react').then(m => m.TrendingUp),
    import('lucide-react').then(m => m.Users),
    import('lucide-react').then(m => m.Star),
    import('lucide-react').then(m => m.Crown),
    import('lucide-react').then(m => m.Medal),
    import('lucide-react').then(m => m.Zap),
    import('lucide-react').then(m => m.BookOpen),
  ]);
};
