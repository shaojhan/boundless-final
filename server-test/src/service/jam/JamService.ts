import type { IJamRepository } from '../../repository/jam/IJamRepository.js';
import type {
  JamFindOptions,
  JamListResult,
  JamDetailResult,
  MyApplyItem,
  FormedJamFindOptions,
  FormedJamListResult,
  FormedJamDetailResult,
  CreateJamInput,
  CreateApplyInput,
  UpdateJamFormInput,
  EditJamInfoInput,
} from '../../domain/jam/Jam.js';

function generateUid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uid = '';
  for (let i = 0; i < 12; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

export class JamService {
  constructor(private readonly repo: IJamRepository) {}

  findJams(opts: JamFindOptions): Promise<JamListResult> {
    return this.repo.findJams(opts);
  }

  findJamByJuid(juid: string, uid?: string): Promise<JamDetailResult> {
    return this.repo.findJamByJuid(juid, uid);
  }

  findMyApplies(uid: string): Promise<MyApplyItem[] | null> {
    return this.repo.findMyApplies(uid);
  }

  findFormedJams(opts: FormedJamFindOptions): Promise<FormedJamListResult> {
    return this.repo.findFormedJams(opts);
  }

  findFormedJamByJuid(juid: string): Promise<FormedJamDetailResult> {
    return this.repo.findFormedJamByJuid(juid);
  }

  async createJam(data: CreateJamInput): Promise<string> {
    const juid = generateUid();
    await this.repo.createJam(juid, data);
    return juid;
  }

  createApply(data: CreateApplyInput): Promise<void> {
    return this.repo.createApply(data);
  }

  updateJamForm(juid: string, data: UpdateJamFormInput): Promise<void> {
    return this.repo.updateJamForm(juid, data);
  }

  joinJam(
    userId: number,
    userUid: string,
    juid: string,
    applierPlay: number
  ): Promise<'form_success' | 'success'> {
    return this.repo.joinJam(userId, userUid, juid, applierPlay);
  }

  cancelApply(id: number): Promise<void> {
    return this.repo.cancelApply(id);
  }

  deleteApply(id: number): Promise<void> {
    return this.repo.deleteApply(id);
  }

  decideApply(id: number, state: number): Promise<'cancel' | 'success'> {
    return this.repo.decideApply(id, state);
  }

  disbandJam(juid: string, memberUids: string[]): Promise<void> {
    return this.repo.disbandJam(juid, memberUids);
  }

  quitJam(userId: number, juid: string, playname: string): Promise<void> {
    return this.repo.quitJam(userId, juid, playname);
  }

  formJamNow(juid: string): Promise<void> {
    return this.repo.formJamNow(juid);
  }

  editJamInfo(juid: string, data: EditJamInfoInput, coverImg?: string): Promise<void> {
    return this.repo.editJamInfo(juid, data, coverImg);
  }
}
