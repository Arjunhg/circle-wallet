'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'
import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Paper,
  Text,
  Grid,
  UnstyledButton,
  Tooltip,
  MantineProvider
} from '@mantine/core'
import '@mantine/core/styles.css'
import { create } from '@mui/material/styles/createTransitions'

let sdk: W3SSdk


interface NotificationItem {
  id: string
  title: string
  body: string
  type: 'success' | 'error'
  timestamp: Date
}

interface ContactItem {
  label: string
  address: string
}

interface NFTItem {
  id: string
  name: string
  description: string
  imageUrl: string
}

function App() {
  useEffect(() => {
    sdk = new W3SSdk()
  }, [])

  const [appId, setAppId] = useState<string>('')
  const [userToken, setUserToken] = useState<string>('')
  const [encryptionKey, setEncryptionKey] = useState<string>('')
  const [challengeId, setChallengeId] = useState<string>('')
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [nfts, setNFTs] = useState<NFTItem[]>([])
  const [fromToken, setFromToken] = useState<string>('')
  const [toToken, setToToken] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    const appId = localStorage.getItem('appId') || ''
    const userToken = localStorage.getItem('userToken') || ''
    const encryptionKey = localStorage.getItem('encryptionKey') || ''
    const challengeId = localStorage.getItem('challengeId') || ''
    const storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]')
    const storedNotification = JSON.parse(localStorage.getItem('notifications') || '[]')
    const storedNFTs = JSON.parse(localStorage.getItem('nfts') || '[]')

    setAppId(appId)
    setUserToken(userToken)
    setEncryptionKey(encryptionKey)
    setChallengeId(challengeId)
    setContacts(storedContacts as ContactItem[])
    setNotifications(storedNotification as NotificationItem[])
    setNFTs(storedNFTs as NFTItem[])
  }, [])

  const onChangeHandler = useCallback(
    (setState: (arg0: any) => void, key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      setState(value)
      localStorage.setItem(key, value)
    },
    []
  )

  const onSubmit = useCallback(() => {
    if (!appId) {
      toast.error('App ID is required')
      return
    }
    sdk.setAppSettings({ appId })
    sdk.setAuthentication({
      userToken: userToken || '',
      encryptionKey: encryptionKey || '',
    })

    sdk.execute(challengeId || 'someChallengeId', (error, result) => {
      if (error) {
        toast.error(`Error: ${error?.message ?? 'Error!'}`)
        const notification: NotificationItem = {
          id: crypto.randomUUID(),
          title: 'Challenge Failed',
          body: `The challenge ${challengeId} failed with error: ${error?.message}`,
          type: 'error',
          timestamp: new Date(),
        }
        setNotifications((prevNotifications) => [...prevNotifications, notification])
        localStorage.setItem('notifications', JSON.stringify([...notifications, notification]))
        return
      }
      toast.success(`Challenge: ${result?.type}, Status: ${result?.status}`)

      //Implement notification features
      const notification: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Challenge Accepted',
        body: `You have successfully completed the challenge ${result?.type}`,
        type: 'success',
        timestamp: new Date(),
      }

      setNotifications((prevNotification) => [...prevNotification, notification])
      localStorage.setItem('notifications', JSON.stringify([...notifications, notification]))
    })
  }, [appId, userToken, encryptionKey, challengeId, notifications])

  const addContact = useCallback(
    (label: string, address: string) => {
      const newContact: ContactItem = { label, address }
      setContacts((prevContacts) => [...prevContacts, newContact])
      localStorage.setItem('contacts', JSON.stringify([...contacts, newContact]))
    },
    [contacts]
  )

  const removeContacts = useCallback(
    (index: number) => {
      const updatedContacts = [...contacts]
      updatedContacts.splice(index, 1)
      setContacts(updatedContacts)
      localStorage.setItem('contacts', JSON.stringify(updatedContacts))
    },
    [contacts]
  )
  const addNFT = useCallback(
    (id: string, name: string, description: string, imageUrl: string) => {
      const newNFT: NFTItem = { id, name, description, imageUrl }
      setNFTs((prevNFTs) => [...prevNFTs, newNFT])
      localStorage.setItem('nfts', JSON.stringify([...nfts, newNFT]))
    },
    [nfts]
  )

  const removeNFT = useCallback(
    (index: number) => {
      const updatedNFTs = [...nfts]
      updatedNFTs.splice(index, 1)
      setNFTs(updatedNFTs)
      localStorage.setItem('nfts', JSON.stringify(updatedNFTs))
    },
    [nfts]
  )

  const handleTokenSwap = () => {
    //TODO: TOken Swap Logic
    console.log(`Swapping ${amount} ${fromToken} for ${toToken}`)
  }

  const removeNotification = useCallback(
    (id: string) => {
      const updatedNotifications = notifications.filter((notification) => notification.id !== id)
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
    },
    [notifications]
  )

  return (
    <MantineProvider>
      <Box mx="auto" p="md">
      <Title order={2} mb="lg">
        Circle Web SDK
      </Title>

      <Paper shadow="xs" p="md" mb="lg">
        <Title order={4} mb="sm">
          App Settings
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="App ID"
              value={appId}
              onChange={onChangeHandler(setAppId, 'appId')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="User Token"
              value={userToken}
              onChange={onChangeHandler(setUserToken, 'userToken')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Encryption Key"
              value={encryptionKey}
              onChange={onChangeHandler(setEncryptionKey, 'encryptionKey')}
            />
            </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Challenge ID"
              value={challengeId}
              onChange={onChangeHandler(setChallengeId, 'challengeId')}
            />
          </Grid.Col>
        </Grid>
        <Group mt="md">
          <Button onClick={onSubmit}>Verify Challenge</Button>
        </Group>
      </Paper>

      <Paper shadow="xs" p="md" mb="lg">
        <Title order={4} mb="sm">
          Contacts
        </Title>
        {contacts.map((contact, index) => (
          <Group key={index} mb="sm">
            <Text>
              <Text>{contact.label}:</Text> {contact.address}
            </Text>
            <UnstyledButton onClick={() => removeContacts(index)}>
              <Tooltip label="Remove contact">
                <Text color="red">
                  ×
                </Text>
              </Tooltip>
            </UnstyledButton>
          </Group>
        ))}
        <Group>
          <TextInput placeholder="Label" id="contactLabel" />
          <TextInput placeholder="Address" id="contactAddress" />
          <Button
            onClick={() => {
              const label = (document.getElementById('contactLabel') as HTMLInputElement).value
              const address = (document.getElementById('contactAddress') as HTMLInputElement).value
              addContact(label, address)
              ;(document.getElementById('contactLabel') as HTMLInputElement).value = ''
              ;(document.getElementById('contactAddress') as HTMLInputElement).value = ''
            }}
          >
            Add Contact
          </Button>
        </Group>
      </Paper>

      <Paper shadow="xs" p="md" mb="lg">
        <Title order={4} mb="sm">
          Notifications
        </Title>
        {notifications.map((notification) => (
            <Group>
              <div>
                <Text>{notification.title}</Text>
                <Text>{notification.body}</Text>
              </div>
              <UnstyledButton onClick={() => removeNotification(notification.id)}>
                <Tooltip label="Remove notification">
                  <Text color="white">
                    ×
                  </Text>
                </Tooltip>
              </UnstyledButton>
            </Group>
        ))}
      </Paper>


      <Paper shadow="xs" p="md" mb="lg">
        <Title order={4} mb="sm">
          NFT Gallery
        </Title>
        <Grid>
          {nfts.map((nft, index) => (
            <Grid.Col key={index} span={3}>
             
                <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%' }} />
                <Text mt="sm">
                  {nft.name}
                </Text>
                <Text size="sm" color="dimmed">
                  {nft.description}
                </Text>
                <Group mt="sm">
                  <UnstyledButton onClick={() => removeNFT(index)}>
                    <Tooltip label="Remove NFT">
                      <Text color="red">
                        ×
                      </Text>
                    </Tooltip>
                  </UnstyledButton>
                </Group>
            </Grid.Col>
          ))}
        </Grid>
        <Group mt="md">
          <TextInput placeholder="NFT ID" id="nftId" />
          <TextInput placeholder="Name" id="nftName" />
          <TextInput placeholder="Description" id="nftDescription" />
          <TextInput placeholder="Image URL" id="nftImageUrl" />
          <Button
            onClick={() => {
              const id = (document.getElementById('nftId') as HTMLInputElement).value
              const name = (document.getElementById('nftName') as HTMLInputElement).value
              const description = (document.getElementById('nftDescription') as HTMLInputElement).value
              const imageUrl = (document.getElementById('nftImageUrl') as HTMLInputElement).value
              addNFT(id, name, description, imageUrl)
              ;(document.getElementById('nftId') as HTMLInputElement).value = ''
              ;(document.getElementById('nftName') as HTMLInputElement).value = ''
              ;(document.getElementById('nftDescription') as HTMLInputElement).value = ''
              ;(document.getElementById('nftImageUrl') as HTMLInputElement).value = ''
            }}
          >
            Add NFT
          </Button>
        </Group>
      </Paper>

      <Paper shadow="xs" p="md" mb="lg">
        <Title order={4} mb="sm">
          Token Swaps
        </Title>
        <Group>
          <TextInput
            label="From Token"
            value={fromToken}
            onChange={onChangeHandler(setFromToken, 'fromToken')}
          />
          <TextInput
            label="To Token"
            value={toToken}
            onChange={onChangeHandler(setToToken, 'toToken')}
          />
        </Group>
        <TextInput
          label="Amount"
          value={amount}
          onChange={onChangeHandler(setAmount, 'amount')}
          mt="md"
        />
        <Group mt="md">
          <Button onClick={handleTokenSwap}>Swap Tokens</Button>
        </Group>
      </Paper>

      <ToastContainer />
    </Box>
    </MantineProvider>
  )
}

export default App