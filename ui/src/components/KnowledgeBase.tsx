"use client"

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  Spinner,
  useColorModeValue,
  Badge,
  Divider,
  Progress,
  Flex,
} from "@chakra-ui/react"
import { useState } from "react"
import { InfoIcon, RepeatIcon, ArrowDownIcon } from "@chakra-ui/icons"
import axios from "axios"

export default function KnowledgeBase() {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const summaryBg = useColorModeValue("gray.50", "gray.600")
  const summaryBorderColor = useColorModeValue("gray.200", "gray.500")

  const fetchSummary = async () => {
    setLoading(true)
    try {
      // Replace with your backend endpoint
      const res = await axios.get("/api/knowledge-base")
      setSummary(res.data.summary)
    } catch (err: any) {
      setSummary("Error: " + (err.response?.data?.error || err.message))
    }
    setLoading(false)
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header Section */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <HStack>
            <Icon as={InfoIcon} color="purple.500" boxSize={6} />
            <Text fontSize="xl" fontWeight="bold">
              Knowledge Base
            </Text>
          </HStack>
          <Badge colorScheme="green" variant="subtle" px={3} py={1}>
            Active
          </Badge>
        </HStack>

        <Text color="gray.600" mb={4}>
          Manage and view the current BTB Finance knowledge base used by the AI bot.
        </Text>

        <HStack spacing={3}>
          <Button
            colorScheme="purple"
            onClick={fetchSummary}
            isLoading={loading}
            leftIcon={<RepeatIcon />}
            size="lg"
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Refresh Summary
          </Button>
          <Button
            variant="outline"
            leftIcon={<ArrowDownIcon />}
            size="lg"
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Export Data
          </Button>
        </HStack>
      </Box>

      {/* Stats Section */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Knowledge Base Statistics
        </Text>
        <VStack spacing={4} align="stretch">
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                Documents Indexed
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                1,247
              </Text>
            </HStack>
            <Progress value={85} colorScheme="blue" borderRadius="full" />
          </Box>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                Last Updated
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                2 hours ago
              </Text>
            </HStack>
            <Progress value={95} colorScheme="green" borderRadius="full" />
          </Box>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                Accuracy Score
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                94.2%
              </Text>
            </HStack>
            <Progress value={94.2} colorScheme="purple" borderRadius="full" />
          </Box>
        </VStack>
      </Box>

      {/* Summary Display */}
      {loading && (
        <Box
          p={8}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text mt={4} color="gray.600">
            Loading knowledge base summary...
          </Text>
        </Box>
      )}

      {summary && (
        <Box
          p={6}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
          transition="all 0.2s"
          _hover={{ boxShadow: "xl" }}
        >
          <HStack mb={4}>
            <Icon as={InfoIcon} color="purple.500" />
            <Text fontWeight="bold" fontSize="lg">
              Current Cached Summary
            </Text>
          </HStack>
          <Divider mb={4} />
          <Box p={4} bg={summaryBg} borderRadius="lg" border="1px" borderColor={summaryBorderColor}>
            <Text lineHeight="tall" whiteSpace="pre-wrap">
              {summary}
            </Text>
          </Box>

          <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.500">
              Generated on {new Date().toLocaleDateString()}
            </Text>
            <Badge colorScheme="green">Fresh</Badge>
          </Flex>
        </Box>
      )}
    </VStack>
  )
}
