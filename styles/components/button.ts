import { lighten } from 'polished';

const Button = {
  baseStyle: {
    fontWeight: '400',
    borderRadius: '24px',
    letterSpacing: '1px',
    padding: '1rem 1rem',
    _hover: {
      background: 'inherit',
    },
    _disabled: {
      opacity: 0.5,
    },
  },
  sizes: {
    md: {
      padding: '1.25rem',
      fontWeight: '300',
      minWidth: '8rem',
    },
    lg: {
      padding: '1.6rem',
      fontWeight: '300',
      minWidth: '10rem',
    },
  },
  variants: {
    icon: {
      border: 'none',
      background: 'none',
      borderWidth: '0',
      padding: '1px',
      _focus: {
        boxShadow: 'none',
      },
      _hover: {
        backgroundColor: 'whiteAlpha.200',
        textDecoration: 'none',
      },
    },
    primary: {
      border: '1px solid',
      background: '#194D44',
      borderWidth: '0',
      // borderColor: 'yellow.500',
      // borderWidth: '1px',
      color: '#fff',
      _focus: {
        boxShadow: 'none',
      },
      _hover: {
        background: lighten(0.2, '#194D44'),
        textDecoration: 'none',
      },
    },
    faded: {
      border: '1px solid',
      background: '#143E37',
      borderWidth: '0',
      //borderColor: '#ddd',
      //borderWidth: '1px',
      color: '#fff',
      _focus: {
        boxShadow: 'none',
      },
      _hover: {
        background: lighten(0.2, '#143E37'),
        textDecoration: 'none',
      },
    },
  },
};

export default Button;
