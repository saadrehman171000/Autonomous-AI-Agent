import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  HStack,
  Text,
  Divider,
  Select,
  Textarea,
  useColorModeValue,
  Badge,
  Icon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
} from "@chakra-ui/react"
import { SettingsIcon, LockIcon, BellIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Settings() {
  const cardBg = useColorModeValue("white", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get("/api/settings")
        setSettings(res.data)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await axios.post("/api/settings", settings)
      setSaveMsg("Settings saved!")
    } catch (err: any) {
      setSaveMsg("Error: " + (err.response?.data?.error || err.message))
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <VStack align="center" justify="center" h="300px">
        <Spinner size="xl" color="purple.500" />
        <Text color="gray.500">Loading settings...</Text>
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
        <HStack mb={2}>
          <Icon as={SettingsIcon} color="purple.500" boxSize={6} />
          <Text fontSize="xl" fontWeight="bold">
            Bot Configuration
          </Text>
        </HStack>
        <Text color="gray.600">Configure your BTB AI Twitter bot settings and preferences</Text>
      </Box>

      {/* AI Model Settings */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            AI Model Configuration
          </Text>
          <Badge colorScheme="purple" variant="subtle">
            Advanced
          </Badge>
        </HStack>

        <VStack align="stretch" spacing={4}>
          <FormControl>
            <FormLabel fontWeight="medium">OpenRouter Model</FormLabel>
            <Select value={settings.model} onChange={e => setSettings({ ...settings, model: e.target.value })}>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="openai/gpt-4">GPT-4</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </Select>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Choose the AI model for generating responses
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">Response Temperature</FormLabel>
            <Slider value={settings.temperature} min={0} max={1} step={0.1} onChange={val => setSettings({ ...settings, temperature: val })}>
              <SliderTrack>
                <SliderFilledTrack bg="purple.500" />
              </SliderTrack>
              <SliderThumb boxSize={4} />
            </Slider>
            <HStack justify="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">
                Conservative
              </Text>
              <Text fontSize="xs" color="gray.500">
                Creative
              </Text>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">System Prompt</FormLabel>
            <Textarea value={settings.systemPrompt} onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })} placeholder="You are a helpful AI assistant for BTB Finance..." rows={4} resize="vertical" />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Custom instructions for the AI model
            </Text>
          </FormControl>
        </VStack>
      </Box>

      {/* Bot Behavior Settings */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Bot Behavior
          </Text>
          <Badge colorScheme="blue" variant="subtle">
            Core
          </Badge>
        </HStack>

        <VStack align="stretch" spacing={4}>
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormLabel mb="0" fontWeight="medium">
                Test Mode
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Enable to test responses without posting to Twitter
              </Text>
            </Box>
            <Switch colorScheme="purple" size="lg" isChecked={settings.testMode} onChange={e => setSettings({ ...settings, testMode: e.target.checked })} />
          </FormControl>

          <Divider />

          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormLabel mb="0" fontWeight="medium">
                Auto Reply
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Automatically reply to mentions
              </Text>
            </Box>
            <Switch colorScheme="purple" size="lg" isChecked={settings.autoReply} onChange={e => setSettings({ ...settings, autoReply: e.target.checked })} />
          </FormControl>

          <Divider />

          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormLabel mb="0" fontWeight="medium">
                Rate Limiting
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Respect Twitter API rate limits
              </Text>
            </Box>
            <Switch colorScheme="purple" size="lg" isChecked={settings.rateLimiting} onChange={e => setSettings({ ...settings, rateLimiting: e.target.checked })} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">Response Delay (seconds)</FormLabel>
            <Input type="number" value={settings.responseDelay} min="1" max="300" onChange={e => setSettings({ ...settings, responseDelay: Number(e.target.value) })} />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Minimum delay between responses
            </Text>
          </FormControl>
        </VStack>
      </Box>

      {/* Security & Notifications */}
      <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <HStack>
            <Icon as={LockIcon} color="green.500" boxSize={5} />
            <Text fontSize="lg" fontWeight="bold">
              Security & Notifications
            </Text>
          </HStack>
          <Badge colorScheme="green" variant="subtle">
            Secure
          </Badge>
        </HStack>

        <VStack align="stretch" spacing={4}>
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormLabel mb="0" fontWeight="medium">
                <HStack>
                  <Icon as={BellIcon} boxSize={4} />
                  <Text>Error Notifications</Text>
                </HStack>
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Get notified when errors occur
              </Text>
            </Box>
            <Switch colorScheme="green" size="lg" isChecked={settings.errorNotifications} onChange={e => setSettings({ ...settings, errorNotifications: e.target.checked })} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">Notification Email</FormLabel>
            <Input type="email" value={settings.notificationEmail} onChange={e => setSettings({ ...settings, notificationEmail: e.target.value })} placeholder="admin@btbfinance.com" />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">API Key Status</FormLabel>
            <HStack>
              <Badge colorScheme="green" px={3} py={1}>
                Active
              </Badge>
              <Text fontSize="sm" color="gray.500">
                Last used 2 minutes ago
              </Text>
            </HStack>
          </FormControl>
        </VStack>
      </Box>

      <Button colorScheme="teal" onClick={handleSave} isLoading={saving} size="lg">
        Save Settings
      </Button>
      {saveMsg && <Text color={saveMsg.startsWith("Error") ? "red.500" : "green.500"}>{saveMsg}</Text>}
    </VStack>
  )
}
