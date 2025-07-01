import {
  Box,
  VStack,
  Text,
  Badge,
  HStack,
  Avatar,
  Icon,
  useColorModeValue,
  Flex,
  Button,
  Divider,
  Spinner,
} from "@chakra-ui/react"
import { TimeIcon, ChatIcon, CheckCircleIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import axios from "axios"

export default function LiveFeed() {
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const [feedItems, setFeedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null)

  useEffect(() => {
    let interval: any;
    async function fetchFeed() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get("/api/live-feed")
        setFeedItems(res.data.feed)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message)
      }
      setLoading(false)
    }
    fetchFeed()
    interval = setInterval(fetchFeed, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied":
        return "green"
      case "pending":
        return "yellow"
      case "processing":
        return "blue"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "replied":
        return CheckCircleIcon
      case "pending":
        return TimeIcon
      case "processing":
        return ChatIcon
      default:
        return TimeIcon
    }
  }

  if (loading) {
    return (
      <VStack align="center" justify="center" h="300px">
        <Spinner size="xl" color="purple.500" />
        <Text color="gray.500">Loading live feed...</Text>
      </VStack>
    )
  }
  if (error) {
    return (
      <VStack align="center" justify="center" h="300px">
        <Text color="red.500">Error: {error}</Text>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="xl" fontWeight="bold">
            Live Twitter Feed
          </Text>
          <Badge colorScheme="green" variant="subtle" px={3} py={1}>
            Live
          </Badge>
        </HStack>
        <Text color="gray.600">Real-time monitoring of mentions and bot responses</Text>
      </Box>

      {/* Feed Items */}
      <VStack align="stretch" spacing={4}>
        {(feedItems || []).map((item) => (
          <Box
            key={item.id}
            p={6}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            border="1px"
            borderColor={borderColor}
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "lg",
              borderColor: "purple.300",
            }}
          >
            <HStack spacing={4} align="start">
              <Avatar size="md" name={item.user} bg="purple.500" color="white" />

              <Box flex="1">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold" color="purple.600">
                    @{item.username || item.user}
                  </Text>
                  <HStack spacing={2}>
                    <Icon as={getStatusIcon(item.status)} color={`${getStatusColor(item.status)}.500`} boxSize={4} />
                    <Badge colorScheme={getStatusColor(item.status)} variant="subtle" textTransform="capitalize">
                      {item.status}
                    </Badge>
                  </HStack>
                </HStack>

                <Text mb={3} lineHeight="tall">
                  {item.message}
                </Text>

                <Divider mb={3} />

                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={TimeIcon} color="gray.400" boxSize={3} />
                    <Text fontSize="sm" color="gray.500">
                      {item.time}
                    </Text>
                  </HStack>

                  {item.status === "pending" && (
                    <Button size="sm" colorScheme="blue" variant="outline">
                      Process Now
                    </Button>
                  )}

                  {item.status === "replied" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      onClick={() => setSelectedReplyId(selectedReplyId === item.id ? null : item.id)}
                    >
                      {selectedReplyId === item.id ? "Hide Reply" : "View Reply"}
                    </Button>
                  )}
                </Flex>

                {selectedReplyId === item.id && (item.fullReply || item.reply) && (
                  <Box mt={4} p={4} bg={useColorModeValue("gray.50", "gray.800")}
                    borderRadius="md" border="1px" borderColor={borderColor}>
                    <Text fontWeight="bold" color="purple.500" mb={2}>Bot Reply:</Text>
                    <Text whiteSpace="pre-wrap">{item.fullReply || item.reply}</Text>
                  </Box>
                )}
              </Box>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* Load More */}
      <Box textAlign="center" pt={4}>
        <Button variant="outline" size="lg" colorScheme="purple">
          Load More Messages
        </Button>
      </Box>
    </VStack>
  )
}
