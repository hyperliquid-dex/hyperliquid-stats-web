import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import Button from './components/button';
import Progress from './components/progress';
import Text from './components/text';
import Modal, { ModalHeader } from './components/modal';
import Drawer from './components/drawer';
import Input from './components/input';
import Tooltip from './components/tooltip';
import Alert from './components/alert';
import { tabsTheme } from './components/tabs';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const breakpoints = {
  xs: '0',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1400px',
  xxl: '2400px',
};

const colors = {
  brand: {
    500: '#97ffe4',
  },
  secondary: {
    500: '#0f2e29',
  },
  blue: {
    200: '#3d6675',
    300: '#5F96AB',
    500: '#01a2d5',
    600: '#022c45',
    800: '#022233',
  },
  red: {
    500: '#C04B32',
  },
  grey: {
    300: '#222',
    400: '#112024',
    500: '#9BA3A6',
  },
  modalOverlayBg: 'linear(to-b, rgba(44, 67, 97, 0.7), rgba(26, 43, 63, 0.7))',
};

const baseTheme = extendTheme({
  config,
  breakpoints,
  colors,
  components: {
    Button,
    Tooltip,
    Input,
    Progress,
    Text,
    Modal,
    ModalHeader,
    Drawer,
    Alert,
    Tabs: tabsTheme,
  },
});

export const theme = extendTheme(baseTheme);

export default baseTheme;
