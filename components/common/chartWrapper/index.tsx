import { useIsMobile } from '@/hooks/useIsMobile';
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

type Props = {
  title: string;
  loading: boolean;
  controls?: {
    toggles: Toggle[];
  };
  zIndex?: number;
  coinSelectors?: CoinSelector[];
  children?: React.ReactNode;
};

function ChartWrapper({ title, loading, controls, zIndex, coinSelectors, children }: Props) {
  const isMobile = useIsMobile();
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

  const coinSelectorsMenu = coinSelectors && (
    <Box>
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
  );

  const menu = (
    <Box display='flex' padding='0'>
      <Grid
        mb='1rem'
        templateColumns='1fr auto'
        gap={controls ? '2' : '0'}
        justifyContent='flex-start'
      >
        {isMobile && controls ? (
          controlButtons
        ) : (
          <ButtonGroup isAttached={true}>{controlButtons}</ButtonGroup>
        )}
        {coinSelectorsMenu}
      </Grid>
    </Box>
  );

  return (
    <Box display='grid' mt='3' p={{ xs: '0', md: '0 5 0 0' }}>
      <Box
        position='relative'
        p={{ xs: '2', md: '4' }}
        bg='#0f2e29'
        boxShadow='0px 0px 7px rgb(0 0 0 / 20%)'
        borderRadius={{ xs: '0', md: '2xl' }}
        zIndex={zIndex}
      >
        <Grid gridTemplateColumns={{ xs: '1fr', xl: '1fr auto' }} gap={4}>
          <Text fontSize='1.2rem' fontWeight='600' whiteSpace={'nowrap'}>
            {title}
          </Text>
          {menu}
        </Grid>
        {loading && <Loader />}
        {children}
      </Box>
    </Box>
  );
}

export default ChartWrapper;
