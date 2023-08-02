'use client';
import React from 'react';
import NextImg from 'next/image';
import { Container, Box, Image, Flex } from '@chakra-ui/react';
import * as S from './styles';
import useScreenSize from '@/hooks/useScreenSize';

const Header = () => {
  const { isMobile } = useScreenSize();

  return (
    <Container maxWidth='100%' position='relative' zIndex='9' m='0' px='1rem'>
      <Box
        my='16px'
        width='100%'
        background='#fff'
        boxShadow='0 2px 12px rgba(7,39,35,.06)'
        py='3'
        px='1rem'
        borderRadius='100px'
        display='flex'
      >
        <Box
          width='100%'
          display='flex'
          alignItems='center'
          justifyContent={{ xs: 'center', md: 'space-between' }}
          zIndex='2'
          paddingY='0'
        >
          <Box display='flex' alignItems='center'>
            <Flex
              as='a'
              href='https://hyperliquid.xyz'
              target='_blank'
              rel='noreferrer'
              cursor='pointer'
              alignItems='center'
            >
              <S.LogoWrapper>
                <NextImg src='/img/logo.svg' alt='Hyperliquid' width='300' height='60' />
              </S.LogoWrapper>
            </Flex>
          </Box>
          {!isMobile && (
            <Flex
              as='a'
              href='https://thunderhead.xyz'
              target='_blank'
              rel='noreferrer'
              cursor='pointer'
              alignItems='center'
            >
              <Flex
                mr='3'
                justifyItems='center'
                justifyContent='center'
                color='#000'
                fontSize='0.9rem'
                fontWeight='500'
                cursor='pointer'
              >
                Built By
              </Flex>
              <Flex
                width='140px'
                height='34px'
                py='0'
                justifyItems='center'
                justifyContent='center'
                cursor='pointer'
              >
                <Image src='/img/thunderhead_light.png' alt='Thunderhead' />
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>
      {isMobile && (
        <Box
          w='100%'
          display='flex'
          justifyContent='center'
          alignItems='center'
          justifyItems='center'
        >
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Flex
              as='a'
              href='https://thunderhead.xyz'
              target='_blank'
              rel='noreferrer'
              cursor='pointer'
              alignItems='center'
              justifyContent='center'
            >
              <Flex
                mr='3'
                color='#000'
                fontSize='0.9rem'
                fontWeight='500'
                cursor='pointer'
                w='52px'
                justifyContent='center'
                alignItems='center'
              >
                Built By
              </Flex>
              <Flex
                height='34px'
                py='0'
                cursor='pointer'
                justifyContent='center'
                alignItems='center'
                position='relative'
              >
                <Image
                  src='/img/thunderhead_light.png'
                  alt='Thunderhead'
                  w='auto'
                  height='40px'
                  position='relative'
                />
              </Flex>
            </Flex>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Header;
