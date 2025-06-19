import {Context, Discovery, Election, IDiscoveryInfo, IListenerMetaData, INodeMetaData, IServiceMetaData, IWorkerMetaData} from '@sora-soft/framework';
import {readFile} from 'fs/promises';
import {RamElection} from './RamElection.js';

const pkg = JSON.parse(
  await readFile(new URL('../../package.json', import.meta.url), {encoding: 'utf-8'})
) as {version: string};

export class RamDiscovery extends Discovery {
  constructor() {
    super();
    this.serviceMap_ = new Map();
    this.listenerMap_ = new Map();
    this.nodeMap_ = new Map();
    this.workerMap_ = new Map();
  }

  async getAllServiceList(): Promise<IServiceMetaData[]> {
    return [...this.serviceMap_].map(([id, service]) => service);
  }

  async getServiceList(name: string): Promise<IServiceMetaData[]> {
    const serviceList = await this.getAllServiceList();
    return serviceList.filter(service => service.name === name);
  }

  async getAllEndpointList(): Promise<IListenerMetaData[]> {
    return [...this.listenerMap_].map(([id, listener]) => listener);
  }

  async getEndpointList(service: string): Promise<IListenerMetaData[]> {
    const serviceList = await this.getServiceList(service);
    const idList = serviceList.map(s => s.id);
    return [...this.listenerMap_].map(([_, info]) => info).filter(info => idList.includes(info.targetId));
  }

  async getNodeList(): Promise<INodeMetaData[]> {
    return [...this.nodeMap_].map(([_, node]) => node);
  }

  async getAllWorkerList(): Promise<IWorkerMetaData[]> {
    return [...this.workerMap_].map(([_, worker]) => worker);
  }

  async getWorkerList(worker: string): Promise<IWorkerMetaData[]> {
    const workerList = await this.getAllWorkerList();
    return workerList.filter(w => w.name === worker);
  }

  async getServiceById(id: string): Promise<IServiceMetaData | undefined> {
    return this.serviceMap_.get(id);
  }

  async getWorkerById(id: string): Promise<IWorkerMetaData | undefined> {
    return this.workerMap_.get(id);
  }

  async getNodeById(id: string): Promise<INodeMetaData | undefined> {
    return this.nodeMap_.get(id);
  }

  async getEndpointById(id: string): Promise<IListenerMetaData | undefined> {
    return this.listenerMap_.get(id);
  }

  async registerWorker(worker: IWorkerMetaData): Promise<void> {
    this.workerMap_.set(worker.id, worker);
  }

  async registerService(service: IServiceMetaData): Promise<void> {
    this.serviceMap_.set(service.id, service);
  }

  async registerEndpoint(info: IListenerMetaData): Promise<void> {
    this.listenerMap_.set(info.id, info);
  }

  async registerNode(node: INodeMetaData): Promise<void> {
    this.nodeMap_.set(node.id, node);
  }

  async unregisterWorker(id: string): Promise<void> {
    this.workerMap_.delete(id);
  }

  async unregisterService(id: string): Promise<void> {
    this.serviceMap_.delete(id);
  }

  async unregisterEndPoint(id: string): Promise<void> {
    this.listenerMap_.delete(id);
  }

  async unregisterNode(id: string): Promise<void> {
    this.nodeMap_.delete(id);
  }

  createElection(name: string): Election {
    return new RamElection(name);
  }

  protected async startup(context: Context): Promise<void> {}
  protected async shutdown(): Promise<void> {}

  get version() {
    return pkg.version;
  }

  get info(): IDiscoveryInfo {
    return {
      type: 'ram',
      version: this.version,
    };
  }

  private serviceMap_: Map<string, IServiceMetaData>;
  private workerMap_: Map<string, IWorkerMetaData>;
  private listenerMap_: Map<string, IListenerMetaData>;
  private nodeMap_: Map<string, INodeMetaData>;
}
