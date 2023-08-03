import React from 'react';
import { useTable, usePagination } from 'react-table';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { largest_user_trade_count } from '../../../constants/api';
import { formatNumberWithOptions } from '../../../helpers/index';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import { formatAddress } from '../../../utils/formatting';

const REQUESTS = [largest_user_trade_count];

export default function TableComponent() {
  const [dataLargestUsersByTradeCount] = useRequest(REQUESTS[0], [], 'table_data');
  const [isMobile] = useMediaQuery('(max-width: 700px)');

  const columns = React.useMemo(
    () => [
      {
        Header: 'Address',
        accessor: 'name' as const,
        Cell: ({ value }: { value: string }) => (
          <span>
            <Box href={`https://arbiscan.io/address/${value}`} target='_blank' as='a'>
              {formatAddress(value, isMobile ? 6 : 6)}
            </Box>
          </span>
        ),
      },
      {
        Header: 'Number of Trades',
        accessor: 'value' as const,
        Cell: ({ value }: { value: number }) => <span>{formatNumberWithOptions(value)}</span>,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: dataLargestUsersByTradeCount ? dataLargestUsersByTradeCount : [],
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination
  );

  return (
    <Box
      position='relative'
      marginTop={3}
      p={{ xs: '2', md: '4 9 4 4' }}
      bg='#0f2e29'
      boxShadow='0px 0px 7px rgb(0 0 0 / 20%)'
      borderRadius={{ xs: '0', md: '2xl' }}
    >
      <Box w='100%' mx='2' display='flex' justifyContent={'space-between'}>
        <Text fontSize='lg' fontWeight='semibold'>
          Largest Trade Count by Users
        </Text>
      </Box>
      <Table {...getTableProps()} variant='simple' size='md' mt='5' w='100%'>
        <Thead>
          {headerGroups.map((headerGroup, i) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, j) => (
                <Th color='#fff' {...column.getHeaderProps()} key={j}>
                  {column.render('Header')}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {page.map((row: any, i: number) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()} key={i}>
                {row.cells.map((cell: any, j: any) => {
                  return (
                    <Td {...cell.getCellProps()} key={j}>
                      {cell.render('Cell')}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Flex mt={4} justify='space-between' flexDirection={{ xs: 'column', md: 'row' }} w='100%'>
        <Box display='flex'>
          <ButtonGroup isAttached={true}>
            <Button
              variant='primary'
              size='sm'
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {'First'}
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              {'<'}
            </Button>
            <Button variant='primary' size='sm' onClick={() => nextPage()} disabled={!canNextPage}>
              {'>'}
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {'Last'}
            </Button>
          </ButtonGroup>
        </Box>
        <Box display='flex' mt={{ xs: '4', md: '0' }}>
          Page: {pageIndex + 1} / {pageCount} | Results: {dataLargestUsersByTradeCount.length}
        </Box>
      </Flex>
    </Box>
  );
}
