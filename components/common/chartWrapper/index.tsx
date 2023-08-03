import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Spinner,
  MenuButton,
  Menu,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Grid,
  useMediaQuery,
} from '@chakra-ui/react';

interface Toggle {
  text: string;
  event: () => void;
  active: boolean;
}

export interface CoinSelector {
  name: string;
  event: () => void;
  isChecked: boolean;
}

const Loader = () => (
  <Box w='100%' position='absolute' top='calc(50% - 10px)' display='flex' justifyContent='center'>
    <Spinner display='flex' w='30px' h='30px' />
  </Box>
);

type Props =  {
  title: string;
  loading: boolean;
  controls?: {
    toggles: Toggle[],
  };
  zIndex?: number;
  coinSelectors?: CoinSelector[];
  children?: React.ReactNode;
}

function ChartWrapper({title, loading, controls, zIndex, coinSelectors, children}: Props) {
  const isMobile = window.innerWidth < 700;
  const controlButtons =
    controls &&
    controls.toggles &&
    controls.toggles.length > 0 &&
    controls.toggles.map((toggle: Toggle, index: number) => {
      return (
        <Button
          key={`toggle-chart-${index}`}
          onClick={() => toggle.event()}
          variant={toggle.active ? 'primary' : 'faded'}
          size='sm'
        >
          {toggle.text}
        </Button>
      );
    });

  return (
    <Box display='grid' width={{ xs: '100%', md: '100%' }} mt='3' p={{ xs: '0', md: '0 5 0 0' }}>
      <Box
        position='relative'
        p={{ xs: '2', md: '4' }}
        bg='#0f2e29'
        boxShadow='0px 0px 7px rgb(0 0 0 / 20%)'
        borderRadius={{ xs: '0', md: '2xl' }}
        zIndex={zIndex}
      >
        <Box w='100%' mb='2'>
          <Box
            w='100%'
            mb='2'
            display='flex'
            justifyContent='space-between'
            flexDirection={{ xs: 'column', md: 'row' }}
          >
            <Text
              display='flex'
              w={{ xs: '100%', md: '100%' }}
              fontSize='1.2rem'
              fontWeight='600'
              whiteSpace={'nowrap'}
            >
              {title}
            </Text>
            {controls && (
              <Box
                w={{ xs: '100%', md: '100%' }}
                display='flex'
                justifyContent={{ xs: 'flex-start', md: 'center' }}
                mb='1rem'
              >
                {isMobile ? (
                  <Grid templateColumns='1fr' gap='2'>
                    {controlButtons}
                  </Grid>
                ) : (
                  <ButtonGroup isAttached={true}>{controlButtons}</ButtonGroup>
                )}
              </Box>
            )}
            {coinSelectors && (
              <Box
                w={{ xs: '100%', md: '100%' }}
                display='flex'
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                mb='1rem'
              >
                <Menu closeOnSelect={false} preventOverflow={true}>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    variant='primary'
                    fontSize={'14px'}
                    size='sm'
                  >
                    Select coins
                  </MenuButton>
                  <MenuList
                    minWidth='100px'
                    maxHeight='300px'
                    overflowY='auto'
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#FFF',
                        borderRadius: '24px',
                      },
                    }}
                  >
                    <MenuOptionGroup
                      type='checkbox'
                      value={coinSelectors
                        .filter((coinSelector: CoinSelector) => coinSelector.isChecked)
                        .map((coinSelector: CoinSelector) => coinSelector.name)}
                    >
                      {coinSelectors.map((coinSelector: CoinSelector, index: number) => {
                        return (
                          <MenuItemOption
                            value={coinSelector.name}
                            key={`toggle-chart-${index}`}
                            onClick={() => coinSelector.event()}
                            isChecked={coinSelector.isChecked}
                          >
                            {coinSelector.name}
                          </MenuItemOption>
                        );
                      })}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              </Box>
            )}
          </Box>
        </Box>
        {loading && <Loader />}
        {children}
      </Box>
    </Box>
  );
}

export default ChartWrapper;
