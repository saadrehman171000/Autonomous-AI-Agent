"use client"

import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Box,
  Progress,
  Icon,
  Text,
  VStack,
  Flex,
  useColorModeValue,
  Badge,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  Center,
} from "@chakra-ui/react"
import { CheckCircleIcon, TimeIcon, ChatIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Dashboard() {
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const trackColor = useColorModeValue("gray.100", "gray.600")
  const hoverBg1 = useColorModeValue("gray.100", "gray.500")
  const hoverBg2 = useColorModeValue("gray.100", "gray.500")

  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // let interval: any // <-- Commented out
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get("/api/dashboard-stats")
        setStats(res.data)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message)
      }
      setLoading(false)
    }

    fetchStats()
    // interval = setInterval(fetchStats, 5000) // <-- Commented out

    // return () => clearInterval(interval) // <-- Commented out
  }, [])

  if (loading) {
    return (
      <Center h="500px">
        <VStack spacing={6}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.500" fontSize="lg">
            Loading dashboard stats...
          </Text>
        </VStack>
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="500px">
        <VStack spacing={6}>
          <Icon as={CheckCircleIcon} color="red.500" boxSize={16} />
          <Text color="red.500" fontSize="lg" textAlign="center">
            Error: {error}
          </Text>
        </VStack>
      </Center>
    )
  }

  return (
    <VStack spacing={10} align="stretch">
      {/* Enhanced Main Stats Grid */}
      <SimpleGrid columns={[1, 2, 2, 4]} spacing={8}>
        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          minH="180px"
        >
          <Stat>
            <Flex justify="space-between" align="center" mb={4}>
              <StatLabel color="gray.500" fontSize="md" fontWeight="semibold">
                Bot Status
              </StatLabel>
              <Icon as={CheckCircleIcon} color="green.400" boxSize={8} />
            </Flex>
            <StatNumber color="green.400" fontSize="3xl" fontWeight="bold" mb={3}>
              {stats.status}
            </StatNumber>
            <StatHelpText>
              <Badge colorScheme="green" variant="solid" px={4} py={2} borderRadius="full" fontSize="sm">
                {stats.status === "Running" ? "🟢 Online" : "🔴 Offline"}
              </Badge>
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          minH="180px"
        >
          <Stat>
            <Flex justify="space-between" align="center" mb={4}>
              <StatLabel color="gray.500" fontSize="md" fontWeight="semibold">
                Mentions Replied
              </StatLabel>
              <Icon as={ChatIcon} color="blue.400" boxSize={8} />
            </Flex>
            <StatNumber fontSize="3xl" fontWeight="bold" mb={3}>
              {stats.mentionsReplied}
            </StatNumber>
            <StatHelpText>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                ↗ {stats.mentionsChange}
              </Badge>
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          minH="180px"
        >
          <Stat>
            <Flex justify="space-between" align="center" mb={4}>
              <StatLabel color="gray.500" fontSize="md" fontWeight="semibold">
                LLM Requests
              </StatLabel>
              <Icon as={TimeIcon} color="purple.400" boxSize={8} />
            </Flex>
            <StatNumber fontSize="3xl" fontWeight="bold" mb={3}>
              {stats.llmRequests}
            </StatNumber>
            <StatHelpText>
              <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
                Today
              </Badge>
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          minH="180px"
        >
          <VStack spacing={4} h="full" justify="center">
            <CircularProgress
              value={stats.responseRate}
              color="purple.400"
              size="100px"
              thickness="10px"
              trackColor={trackColor}
            >
              <CircularProgressLabel fontSize="xl" fontWeight="bold">
                {stats.responseRate}%
              </CircularProgressLabel>
            </CircularProgress>
            <Text textAlign="center" color="gray.500" fontSize="md" fontWeight="semibold" whiteSpace="nowrap">
              Response Rate
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Enhanced Performance Metrics */}
      <SimpleGrid columns={[1, 1, 2]} spacing={8}>
        <Box p={8} bg={cardBg} borderRadius="2xl" boxShadow="xl" border="1px" borderColor={borderColor} minH="300px">
          <Text fontSize="xl" fontWeight="bold" mb={6}>
            📊 Daily Activity
          </Text>
          <VStack spacing={6} align="stretch">
            <Box>
              <Flex justify="space-between" mb={3}>
                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  Mentions Processed
                </Text>
                <Text fontSize="md" fontWeight="bold">
                  {stats.mentionsProcessed}
                </Text>
              </Flex>
              <Progress
                value={stats.mentionsProcessedPercent}
                colorScheme="blue"
                borderRadius="full"
                size="lg"
                bg={useColorModeValue("gray.100", "gray.600")}
              />
            </Box>

            <Box>
              <Flex justify="space-between" mb={3}>
                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  Response Time
                </Text>
                <Text fontSize="md" fontWeight="bold">
                  {stats.responseTimeAvg}
                </Text>
              </Flex>
              <Progress
                value={stats.responseTimePercent}
                colorScheme="green"
                borderRadius="full"
                size="lg"
                bg={useColorModeValue("gray.100", "gray.600")}
              />
            </Box>

            <Box>
              <Flex justify="space-between" mb={3}>
                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  API Usage
                </Text>
                <Text fontSize="md" fontWeight="bold">
                  {stats.apiUsage}
                </Text>
              </Flex>
              <Progress
                value={stats.apiUsagePercent}
                colorScheme="purple"
                borderRadius="full"
                size="lg"
                bg={useColorModeValue("gray.100", "gray.600")}
              />
            </Box>
          </VStack>
        </Box>

        <Box p={8} bg={cardBg} borderRadius="2xl" boxShadow="xl" border="1px" borderColor={borderColor} minH="300px">
          <Text fontSize="xl" fontWeight="bold" mb={6}>
            🕒 Recent Activity
          </Text>
          <VStack spacing={4} align="stretch">
            {(stats.recentActivity || []).map((item: any, idx: number) => (
              <Flex
                key={idx}
                p={4}
                bg={item.color === "gray.50" ? hoverBg1 : hoverBg2}
                borderRadius="lg"
                align="center"
                transition="all 0.2s"
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.500"),
                  transform: "translateX(4px)",
                }}
              >
                <Box w={3} h={3} bg={item.color} borderRadius="full" mr={4} />
                <Text fontSize="sm" flex="1" fontWeight="medium">
                  {item.text}
                </Text>
                <Badge variant="subtle" colorScheme="gray" fontSize="xs" px={2} py={1}>
                  {item.time}
                </Badge>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  )
}
