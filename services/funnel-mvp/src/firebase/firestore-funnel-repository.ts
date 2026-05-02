import type { Firestore } from "firebase-admin/firestore";

import type {
  AnalysisRun,
  DeliverableRecord,
  EvidenceBundle,
  JobRun,
  LeadSession,
  MessageRecord,
  PaymentRecord
} from "../types/domain.js";
import type { FunnelRepository } from "../services/funnel-repository.js";

export class FirestoreFunnelRepository implements FunnelRepository {
  constructor(private readonly firestore: Firestore) {}

  async createLeadSession(session: LeadSession) {
    await this.firestore.collection("leadSessions").doc(session.id).set(session);
  }

  async updateLeadSession(sessionId: string, patch: Partial<LeadSession>) {
    const ref = this.firestore.collection("leadSessions").doc(sessionId);
    await ref.set(patch, { merge: true });
    const snapshot = await ref.get();
    return snapshot.data() as LeadSession;
  }

  async getLeadSession(sessionId: string) {
    const snapshot = await this.firestore.collection("leadSessions").doc(sessionId).get();
    return snapshot.exists ? (snapshot.data() as LeadSession) : null;
  }

  async findLeadSessionByActor(username: string, platform: string) {
    const query = await this.firestore
      .collection("leadSessions")
      .where("username", "==", username)
      .where("platform", "==", platform)
      .limit(1)
      .get();

    return query.empty ? null : (query.docs[0]?.data() as LeadSession);
  }

  async saveMessage(message: MessageRecord) {
    await this.firestore.collection("leadSessions").doc(message.sessionId).collection("messages").doc(message.id).set(message);
  }

  async saveEvidenceBundle(bundle: EvidenceBundle) {
    await this.firestore.collection("leadSessions").doc(bundle.sessionId).collection("evidenceBundles").doc(bundle.id).set(bundle);
  }

  async saveAnalysisRun(run: AnalysisRun) {
    await this.firestore.collection("leadSessions").doc(run.sessionId).collection("analysisRuns").doc(run.id).set(run);
  }

  async listAnalysisRuns(sessionId: string) {
    const snapshot = await this.firestore
      .collection("leadSessions")
      .doc(sessionId)
      .collection("analysisRuns")
      .orderBy("createdAt", "asc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as AnalysisRun);
  }

  async saveJobRun(jobRun: JobRun) {
    await this.firestore.collection("leadSessions").doc(jobRun.sessionId).collection("jobRuns").doc(jobRun.id).set(jobRun);
  }

  async updateJobRun(jobRunId: string, sessionId: string, patch: Partial<JobRun>) {
    await this.firestore
      .collection("leadSessions")
      .doc(sessionId)
      .collection("jobRuns")
      .doc(jobRunId)
      .set(patch, { merge: true });
  }

  async savePayment(payment: PaymentRecord) {
    await this.firestore.collection("leadSessions").doc(payment.sessionId).collection("payments").doc(payment.id).set(payment);
  }

  async getLatestPayment(sessionId: string) {
    const snapshot = await this.firestore
      .collection("leadSessions")
      .doc(sessionId)
      .collection("payments")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    return snapshot.empty ? null : (snapshot.docs[0]?.data() as PaymentRecord);
  }

  async saveDeliverable(deliverable: DeliverableRecord) {
    await this.firestore
      .collection("leadSessions")
      .doc(deliverable.sessionId)
      .collection("deliverables")
      .doc(deliverable.id)
      .set(deliverable);
  }

  async hasProcessedExternalEvent(eventId: string) {
    const snapshot = await this.firestore.collection("processedEvents").doc(eventId).get();
    return snapshot.exists;
  }

  async markExternalEventProcessed(eventId: string) {
    await this.firestore.collection("processedEvents").doc(eventId).set({ processed: true });
  }
}
