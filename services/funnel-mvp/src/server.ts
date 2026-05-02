import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { buildApp, type AppContainer } from "./app.js";
import { OllamaDocumentExtractionService } from "./ai/ollama-document-extraction-service.js";
import { AnthropicCompatibleMiniMaxClient } from "./ai/minimax-client.js";
import { loadConfig } from "./config/env.js";
import { FirestoreFunnelRepository } from "./firebase/firestore-funnel-repository.js";
import { FirebaseStorageAdapter } from "./firebase/firebase-storage-adapter.js";
import { LemonApiService } from "./payments/lemon-service.js";
import { PayPalApiService } from "./payments/paypal-service.js";
import type { SendMessageInput, MessageAdapter } from "./services/message-adapter.js";
import { NotionApiService } from "./services/notion-service.js";

class LoggingMessageAdapter implements MessageAdapter {
  async sendMessage(input: SendMessageInput) {
    console.log("Simulated message delivery", input);
  }
}

function initializeFirebase(config: ReturnType<typeof loadConfig>) {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      }),
      storageBucket: config.FIREBASE_STORAGE_BUCKET
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    storageBucket: config.FIREBASE_STORAGE_BUCKET
  });
}

async function main() {
  const config = loadConfig();
  const firebaseApp = initializeFirebase(config);
  const firestore = getFirestore(firebaseApp);
  const bucket = getStorage(firebaseApp).bucket();

  const container: AppContainer = {
    config,
    repository: new FirestoreFunnelRepository(firestore),
    messageAdapter: new LoggingMessageAdapter(),
    minimaxClient: new AnthropicCompatibleMiniMaxClient({
      apiKey: config.MINIMAX_API_KEY ?? "",
      baseUrl: config.MINIMAX_BASE_URL,
      model: config.MINIMAX_MODEL
    }),
    documentExtractionService: new OllamaDocumentExtractionService({
      baseUrl: config.OLLAMA_BASE_URL,
      model: config.OLLAMA_MODEL
    }),
    storageAdapter: new FirebaseStorageAdapter(bucket),
    notionService: new NotionApiService({
      apiKey: config.NOTION_API_KEY ?? "",
      databaseId: config.NOTION_DATABASE_ID ?? ""
    }),
    lemonService: new LemonApiService({
      apiKey: config.LEMON_API_KEY ?? "",
      storeId: config.LEMON_STORE_ID ?? "",
      variantId: config.LEMON_VARIANT_ID ?? "",
      webhookSecret: config.LEMON_WEBHOOK_SECRET ?? ""
    }),
    paypalService: new PayPalApiService({
      clientId: config.PAYPAL_CLIENT_ID ?? "",
      clientSecret: config.PAYPAL_CLIENT_SECRET ?? "",
      apiBaseUrl: config.PAYPAL_API_BASE_URL,
      webhookId: config.PAYPAL_WEBHOOK_ID ?? "",
      appBaseUrl: config.APP_BASE_URL
    })
  };

  const app = buildApp(container);
  await app.listen({
    host: "0.0.0.0",
    port: config.PORT
  });
}

void main();
