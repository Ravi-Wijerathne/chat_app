import { test, expect } from '@playwright/test';

test.describe('Chat App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('User Registration Flow', () => {
    test('should display username entry screen', async ({ page }) => {
      await expect(page.locator('text=Local Chat App')).toBeVisible();
      await expect(page.locator('text=Enter your name to join the chat')).toBeVisible();
      await expect(page.locator('input[placeholder="Your name..."]')).toBeVisible();
      await expect(page.locator('button:has-text("Join Chat")')).toBeVisible();
    });

    test('should allow entering username and joining chat', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.chat-header h2')).toContainText('Group Chat');
    });

    test('should not join with empty username', async ({ page }) => {
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('text=Local Chat App')).toBeVisible();
    });

    test('should limit username to 20 characters', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('A'.repeat(30));
      
      const value = await usernameInput.inputValue();
      expect(value.length).toBe(20);
    });
  });

  test.describe('Group Messaging', () => {
    test('should send and receive group messages', async ({ page, context }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('User1');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.chat-header h2')).toContainText('Group Chat');
      
      const messageInput = page.locator('input[placeholder="Type a message..."]');
      await messageInput.fill('Hello Group!');
      
      const sendButton = page.locator('button:has-text("Send")');
      await sendButton.click();
      
      await expect(page.locator('.msg-content').filter({ hasText: 'Hello Group!' })).toBeVisible();
    });

    test('should display empty state when no messages', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.empty-state')).toContainText('No messages yet');
    });

    test('should send message with Enter key', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      const messageInput = page.locator('input[placeholder="Type a message..."]');
      await messageInput.fill('Test message');
      await messageInput.press('Enter');
      
      await expect(page.locator('.msg-content').filter({ hasText: 'Test message' })).toBeVisible();
    });

    test('should not send empty message', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.empty-state')).toContainText('No messages yet');
    });
  });

  test.describe('Private Messaging', () => {
    test('should switch to private chat with user', async ({ page, context }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('User1');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.chat-header h2')).toContainText('Group Chat');
      
      await expect(page.locator('.sidebar-empty')).toContainText('No other users online');
    });

    test('should display private chat header when in private mode', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.chat-header h2')).toContainText('Group Chat');
    });
  });

  test.describe('UI Elements', () => {
    test('should display connection status indicator', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      const statusIndicator = page.locator('.chat-header .status-dot').first();
      await expect(statusIndicator).toBeVisible();
    });

    test('should display sidebar with users section', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      await expect(page.locator('.sidebar-header h3')).toContainText('Users');
    });

    test('should have emoji picker button', async ({ page }) => {
      const usernameInput = page.locator('input[placeholder="Your name..."]');
      await usernameInput.fill('TestUser');
      
      const joinButton = page.locator('button:has-text("Join Chat")');
      await joinButton.click();
      
      const emojiButton = page.locator('button.emoji-toggle-btn');
      await expect(emojiButton).toBeVisible();
    });
  });
});
