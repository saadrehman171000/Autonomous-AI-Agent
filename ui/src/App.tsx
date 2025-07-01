"use client"

import {
  Box,
  Flex,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  IconButton,
  Avatar,
  Text,
  Divider,
  useColorModeValue,
  Container,
  HStack,
  Tooltip,
} from "@chakra-ui/react"
import { SunIcon, MoonIcon, BellIcon } from "@chakra-ui/icons"
import Dashboard from "./components/Dashboard"
import LiveFeed from "./components/LiveFeed"
import TestPanel from "./components/TestPanel"
import Settings from "./components/Settings"
import Logs from "./components/Logs"
import KnowledgeBase from "./components/KnowledgeBase"

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode()

  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )

  const sidebarBg = useColorModeValue("whiteAlpha.900", "gray.800")
  const sidebarShadow = useColorModeValue("xl", "dark-lg")

  // Tab colors for light and dark modes
  const tabColor = useColorModeValue("gray.600", "gray.300")
  const selectedTabColor = useColorModeValue("white", "white")
  const tabListBg = useColorModeValue("gray.50", "gray.700")

  return (
    <Flex minH="100vh" bgGradient={bgGradient} w="100vw">
      {/* Enhanced Sidebar */}
      <Box
        w={["0", "280px"]}
        bg={sidebarBg}
        boxShadow={sidebarShadow}
        p={6}
        display={["none", "block"]}
        borderRight="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
      >
        {/* Logo Section */}
        <Flex align="center" mb={8}>
          <Avatar size="sm" bg="purple.500" color="white" name="BTB AI" mr={3} />
          <Box>
            <Heading size="md" color="purple.600" fontWeight="bold">
              BTB AI Bot
            </Heading>
            <Text fontSize="xs" color="gray.500">
              v2.1.0
            </Text>
          </Box>
        </Flex>

        <Divider mb={6} />

        {/* Navigation */}
        <VStack align="stretch" spacing={2}>
          <Box
            p={3}
            borderRadius="lg"
            bg="purple.500"
            color="white"
            fontWeight="bold"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ transform: "translateX(4px)" }}
          >
            📊 Dashboard
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            color="gray.600"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          >
            📡 Live Feed
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            color="gray.600"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          >
            🧪 Manual Test
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            color="gray.600"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          >
            📚 Knowledge Base
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            color="gray.600"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          >
            📋 Logs
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            color="gray.600"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.100", transform: "translateX(4px)" }}
          >
            ⚙️ Settings
          </Box>
        </VStack>

        {/* Status Indicator */}
        <Box mt={8} p={4} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
          <HStack>
            <Box w={2} h={2} bg="green.400" borderRadius="full" />
            <Text fontSize="sm" color="green.700" fontWeight="medium">
              Bot Online
            </Text>
          </HStack>
        </Box>
      </Box>

      {/* Enhanced Main Content */}
      <Box flex="1" p={[2, 8]} maxW="none" w="full">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" bgGradient="linear(to-r, purple.600, blue.600)" bgClip="text" fontWeight="extrabold">
              BTB AI Twitter Bot Dashboard
            </Heading>
            <Text color="gray.500" mt={1}>
              Monitor and manage your AI-powered Twitter bot
            </Text>
          </Box>

          <HStack spacing={3}>
            <Tooltip label="Notifications">
              <IconButton
                aria-label="Notifications"
                icon={<BellIcon />}
                variant="ghost"
                size="lg"
                position="relative"
              />
            </Tooltip>

            <Tooltip label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="lg"
                bg={useColorModeValue("white", "gray.700")}
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.600"),
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Enhanced Tabs */}
        <Container maxW="none" p={0} w="full">
          <Tabs
            variant="soft-rounded"
            colorScheme="purple"
            isFitted
            bg={useColorModeValue("white", "gray.800")}
            p={6}
            borderRadius="2xl"
            boxShadow={useColorModeValue("xl", "dark-lg")}
            border="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            w="full"
          >
            <TabList mb={6} bg={tabListBg} p={2} borderRadius="xl">
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                📊 Dashboard
              </Tab>
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                📡 Live Feed
              </Tab>
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                🧪 Manual Test
              </Tab>
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                📚 Knowledge Base
              </Tab>
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                📋 Logs
              </Tab>
              <Tab
                fontWeight="semibold"
                color={tabColor}
                _selected={{
                  color: selectedTabColor,
                  bg: "purple.500",
                }}
                _hover={{
                  color: useColorModeValue("purple.600", "purple.300"),
                }}
              >
                ⚙️ Settings
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <Dashboard />
              </TabPanel>
              <TabPanel p={0}>
                <LiveFeed />
              </TabPanel>
              <TabPanel p={0}>
                <TestPanel />
              </TabPanel>
              <TabPanel p={0}>
                <KnowledgeBase />
              </TabPanel>
              <TabPanel p={0}>
                <Logs />
              </TabPanel>
              <TabPanel p={0}>
                <Settings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Flex>
  )
}