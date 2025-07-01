"use client"

import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Button,
  useColorModeValue,
  Flex,
  Input,
  Select,
  Spinner,
  Wrap,
  WrapItem,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import { InfoIcon, WarningIcon, WarningTwoIcon, SearchIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Logs() {
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const logBg = useColorModeValue("gray.50", "gray.600")
  const hoverBg = useColorModeValue("gray.100", "gray.500")
  const scrollbarTrackBg = useColorModeValue("#f1f1f1", "#2d3748")
  const scrollbarThumbBg = useColorModeValue("#c1c1c1", "#4a5568")
  const timestampBg = useColorModeValue("gray.100", "gray.600")

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: any
    async function fetchLogs() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get("/api/logs")
        setLogs(res.data.logs)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message)
      }
      setLoading(false)
    }

    fetchLogs()
    interval = setInterval(fetchLogs, 5000)

    return () => clearInterval(interval)
  }, [])

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "red"
      case "warning":
        return "yellow"
      case "success":
        return "green"
      case "info":
        return "blue"
      default:
        return "gray"
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return WarningTwoIcon
      case "warning":
        return WarningIcon
      case "success":
        return InfoIcon
      case "info":
        return InfoIcon
      default:
        return InfoIcon
    }
  }

  if (loading) {
    return (
      <VStack align="center" justify="center" h="400px" spacing={4}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text color="gray.500" fontSize="lg">
          Loading logs...
        </Text>
      </VStack>
    )
  }

  if (error) {
    return (
      <VStack align="center" justify="center" h="400px" spacing={4}>
        <Icon as={WarningTwoIcon} color="red.500" boxSize={12} />
        <Text color="red.500" fontSize="lg" textAlign="center">
          Error: {error}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" spacing={8}>
      {/* Enhanced Header with Controls */}
      <Box p={8} bg={cardBg} borderRadius="2xl" boxShadow="xl" border="1px" borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={1}>
              System Logs
            </Text>
            <Text color="gray.500" fontSize="md">
              Real-time monitoring of system events and activities
            </Text>
          </Box>
          <Badge colorScheme="blue" variant="subtle" px={4} py={2} borderRadius="full" fontSize="sm">
            🔴 Live
          </Badge>
        </Flex>

        {/* Enhanced Filter Controls */}
        <Flex direction={["column", "column", "row"]} gap={4} align="stretch">
          <InputGroup flex="2" size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search logs by message, level, or timestamp..."
              bg={logBg}
              border="2px"
              borderColor="transparent"
              _focus={{
                borderColor: "purple.500",
                boxShadow: "0 0 0 1px purple.500",
              }}
              _hover={{
                borderColor: "purple.300",
              }}
            />
          </InputGroup>

          <Select
            size="lg"
            defaultValue="all"
            minW={["full", "full", "180px"]}
            bg={logBg}
            border="2px"
            borderColor="transparent"
            _focus={{
              borderColor: "purple.500",
              boxShadow: "0 0 0 1px purple.500",
            }}
            _hover={{
              borderColor: "purple.300",
            }}
          >
            <option value="all">All Levels</option>
            <option value="error">🔴 Errors</option>
            <option value="warning">🟡 Warnings</option>
            <option value="success">🟢 Success</option>
            <option value="info">🔵 Info</option>
          </Select>

          <Button
            leftIcon={<SearchIcon />}
            colorScheme="purple"
            size="lg"
            minW={["full", "full", "140px"]}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
          >
            Apply Filter
          </Button>
        </Flex>
      </Box>

      {/* Enhanced Logs Container */}
      <Box
        p={8}
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="xl"
        border="1px"
        borderColor={borderColor}
        maxH="600px"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: scrollbarTrackBg,
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: scrollbarThumbBg,
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: useColorModeValue("#a8a8a8", "#2d3748"),
          },
        }}
      >
        <VStack align="stretch" spacing={4}>
          {(logs || []).map((log) => (
            <Box
              key={log.id}
              p={6}
              bg={logBg}
              borderRadius="xl"
              border="2px"
              borderColor={`${getLogColor(log.level)}.200`}
              borderLeftWidth="6px"
              borderLeftColor={`${getLogColor(log.level)}.500`}
              transition="all 0.3s"
              _hover={{
                bg: hoverBg,
                transform: "translateX(4px)",
                boxShadow: "lg",
                borderColor: `${getLogColor(log.level)}.300`,
              }}
            >
              <Flex justify="space-between" align="start" mb={3} wrap="wrap" gap={2}>
                <HStack spacing={4}>
                  <Icon as={getLogIcon(log.level)} color={`${getLogColor(log.level)}.500`} boxSize={6} />
                  <Badge
                    colorScheme={getLogColor(log.level)}
                    variant="solid"
                    textTransform="uppercase"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {log.level}
                  </Badge>
                </HStack>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontFamily="mono"
                  bg={timestampBg}
                  px={3}
                  py={1}
                  borderRadius="md"
                  whiteSpace="nowrap"
                >
                  {log.timestamp}
                </Text>
              </Flex>

              <Text fontWeight="semibold" mb={2} fontSize="md" lineHeight="tall">
                {log.message}
              </Text>

              <Text fontSize="sm" color="gray.600" lineHeight="relaxed">
                {log.details}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Enhanced Footer Actions */}
      <Flex
        justify="space-between"
        align="center"
        p={6}
        bg={cardBg}
        borderRadius="xl"
        boxShadow="md"
        border="1px"
        borderColor={borderColor}
        wrap="wrap"
        gap={4}
      >
        <Text fontSize="md" color="gray.500" fontWeight="medium">
          Showing {(logs || []).length} log entries
        </Text>
        <Wrap spacing={3}>
          <WrapItem>
            <Button size="md" variant="outline" colorScheme="gray">
              Export Logs
            </Button>
          </WrapItem>
          <WrapItem>
            <Button size="md" variant="outline" colorScheme="red">
              Clear All
            </Button>
          </WrapItem>
          <WrapItem>
            <Button size="md" colorScheme="purple">
              Refresh
            </Button>
          </WrapItem>
        </Wrap>
      </Flex>
    </VStack>
  )
}
