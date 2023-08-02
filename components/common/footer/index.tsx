'use client';
import React from 'react';
import { Box, Text, Flex, Image, Container } from '@chakra-ui/react';
import { FaGithub, FaTelegram } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box width='100%' position='relative' paddingTop='0' mt='10'>
      <Box width='100%' bg='#050b0c' pt='5' zIndex='2' position='relative'>
        <Container maxWidth='container.xl'>
          <Flex
            width='100%'
            py='6'
            justifyItems='center'
            justifyContent='space-between'
            flexDirection={{ xs: 'column', md: 'row' }}
            alignItems='center'
          >
            <Flex
              as='a'
              href='https://thunderhead.world'
              target='_blank'
              rel='noreferrer'
              cursor='pointer'
              alignItems='center'
            >
              <Flex
                py='5'
                mr='4'
                justifyItems='center'
                justifyContent='center'
                color='whiteAlpha.600'
                fontSize='1.2rem'
              >
                Built By
              </Flex>
              <Flex width='240px' py='6' justifyItems='center' justifyContent='center'>
                <Image alt='Thunderhead' src='/img/logo.png' />
              </Flex>
            </Flex>
            <Flex>
              <Flex mt='0.5'>
                <Flex
                  as='a'
                  href='https://github.com/hyperliquid-dex/hyperliquid-stats-web'
                  target='_blank'
                  rel='noreferrer'
                  flexDirection='row'
                  justifyItems='center'
                  alignItems='center'
                >
                  <Flex>
                    <FaGithub size={34} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex mt='0.5' ml='5'>
                <Flex
                  as='a'
                  href='https://telegram.me/hyperliquidX'
                  target='_blank'
                  rel='noreferrer'
                  flexDirection='row'
                  justifyItems='center'
                  alignItems='center'
                >
                  <Flex>
                    <FaTelegram size={34} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
