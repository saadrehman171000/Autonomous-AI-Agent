"use client"

import { useState } from "react"
import {
  Box,
  Textarea,
  Button,
  VStack,
  Text,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  Divider,
  Progress,
  Flex,
} from "@chakra-ui/react"
import { ChatIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import axios from "axios"

export default function TestPanel() {
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const [input, setInput] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setResponse(null)
    setResponseTime(null)

    const startTime = Date.now()

    try {
      // Replace with your backend endpoint
      const res = await axios.post("/api/test-mention", { text: input })
      setResponse(res.data.reply)
      setResponseTime(Date.now() - startTime)
    } catch (err: any) {
      setResponse("Error: " + (err.response?.data?.error || err.message))
      setResponseTime(Date.now() - startTime)
    }
    setLoading(false)
  }

  const exampleTweets = [
    "What is $BTB Finance and how does it work?",
    "How do I stake BTB tokens?",
    "What are the tokenomics of BTB?",
    "Is BTB available on multiple chains?",
  ]

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack mb={2}>
          <Icon as={ChatIcon} color="blue.500" boxSize={6} />
          <Text fontSize="xl" fontWeight="bold">
            Manual Test Panel
          </Text>
        </HStack>
        <Text color="gray.600">Test your bot's responses to different types of mentions and questions</Text>
      </Box>

      {/* Input Section */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Test Input
        </Text>

        <VStack align="stretch" spacing={4}>
          <Textarea
            placeholder="Type a fake tweet mentioning $BTB or ask a question about BTB Finance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            resize="vertical"
            bg={useColorModeValue("gray.50", "gray.600")}
            border="2px"
            borderColor={useColorModeValue("gray.200", "gray.500")}
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 1px blue.500",
            }}
          />

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {input.length}/280 characters
            </Text>
            <Progress value={(input.length / 280) * 100} size="sm" colorScheme="blue" w="100px" borderRadius="full" />
          </HStack>

          <Button
            colorScheme="blue"
            onClick={handleTest}
            isLoading={loading}
            loadingText="Generating Response..."
            size="lg"
            isDisabled={!input.trim()}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Test Bot Reply
          </Button>
        </VStack>
      </Box>

      {/* Example Tweets */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Quick Test Examples
        </Text>
        <VStack align="stretch" spacing={2}>
          {exampleTweets.map((tweet, index) => (
            <Box
              key={index}
              p={3}
              bg={cardBg}
              borderRadius="lg"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: useColorModeValue("blue.50", "blue.900"),
                transform: "translateX(4px)",
              }}
              onClick={() => setInput(tweet)}
            >
              <Text fontSize="sm">{tweet}</Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Response Section */}
      {(response || loading) && (
        <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <HStack>
              <Icon
                as={response?.startsWith("Error:") ? WarningIcon : CheckCircleIcon}
                color={response?.startsWith("Error:") ? "red.500" : "green.500"}
                boxSize={5}
              />
              <Text fontSize="lg" fontWeight="bold">
                Bot Response
              </Text>
            </HStack>

            {responseTime && (
              <Badge
                colorScheme={responseTime < 2000 ? "green" : responseTime < 5000 ? "yellow" : "red"}
                variant="subtle"
                px={3}
                py={1}
              >
                {responseTime}ms
              </Badge>
            )}
          </HStack>

          <Divider mb={4} />

          <Box p={4} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor} minH="100px">
            {loading ? (
              <VStack spacing={3}>
                <Progress size="sm" isIndeterminate colorScheme="blue" w="full" />
                <Text color="gray.500">Generating AI response...</Text>
              </VStack>
            ) : (
              <Text lineHeight="tall" whiteSpace="pre-wrap">
                {response}
              </Text>
            )}
          </Box>

          {response && !loading && (
            <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px" borderColor={borderColor}>
              <HStack spacing={4}>
                <Badge colorScheme="blue" variant="outline">
                  {response.length} characters
                </Badge>
                <Badge colorScheme="purple" variant="outline">
                  {response.split(" ").length} words
                </Badge>
              </HStack>

              <HStack spacing={2}>
                <Button size="sm" variant="outline">
                  Copy Response
                </Button>
                <Button size="sm" colorScheme="blue" variant="outline">
                  Test Again
                </Button>
              </HStack>
            </Flex>
          )}
        </Box>
      )}
    </VStack>
  )
}
