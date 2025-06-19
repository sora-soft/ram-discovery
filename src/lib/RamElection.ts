import {Context, Election, Waiter} from '@sora-soft/framework';
import {BehaviorSubject} from '@sora-soft/framework/rxjs';

export class RamElection extends Election {
  constructor(name: string) {
    super(name);
    this.candidates_ = [];
    this.leaderSubject_ = new BehaviorSubject<string | undefined>(undefined);
    this.waiter_ = new Waiter();
    this.waiterMap_ = new Map();
  }

  async campaign(id: string, context?: Context): Promise<void> {
    const ret = this.waiter_.wait();
    this.waiterMap_.set(id, ret.id);
    this.candidates_.push(id);
    this.doElection();
    await ret.promise;
  }

  async resign(): Promise<void> {}

  async leader(): Promise<string | undefined> {
    return this.leader_;
  }

  observer(): BehaviorSubject<string | undefined> {
    return this.leaderSubject_;
  }

  private doElection() {
    if (this.leader_)
      return;
    if (!this.candidates_.length)
      return;
    const leader = this.candidates_.shift();
    if (!leader)
      return;

    this.leader_ = leader;
    const wait = this.waiterMap_.get(leader);
    if (!wait)
      return;

    this.waiter_.emit(wait);
    this.leaderSubject_.next(leader);
  }

  private waiter_: Waiter<void>;
  private candidates_: string[];
  private waiterMap_: Map<string, number>;
  private leader_?: string;
  private leaderSubject_: BehaviorSubject<string | undefined>;
}
