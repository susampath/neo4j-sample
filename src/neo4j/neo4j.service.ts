import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Neo4jConfig } from './neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import neo4j, { Result, Driver } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  constructor(
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
  ) {}

  getDriver(): Driver {
    return this.driver;
  }

  getConfig(): Neo4jConfig {
    return this.config;
  }

  getReadSession(database?: string) {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.READ,
    });
  }

  getWriteSession(database?: string) {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  async read(
    cypher: string,
    params: Record<string, any>,
    database?: string,
  ): Promise<Result> {
    const session = this.getReadSession(database);
    const txc = session.beginTransaction();

    try {
      const result = await txc.run(cypher, params);
      await txc.commit();
      return result;
    } catch (error) {
      await txc.rollback();
    } finally {
      await session.close();
    }
  }

  async write(
    cypher: string,
    params: Record<string, any>,
    database?: string,
  ): Promise<Result> {
    const session = this.getWriteSession(database);
    const txc = session.beginTransaction();
    try {
      const result = await txc.run(cypher, params);
      await txc.commit();
      return result;
    } catch (error) {
      await txc.rollback();
    } finally {
      await session.close();
    }
  }

  onApplicationShutdown() {
    return this.driver.close();
  }
}
