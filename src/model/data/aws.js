// src/model/data/aws.js
const { v4: uuid } = require('uuid');
const {
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { dynamoClient, s3Client } = require('../../aws/clients');
const logger = require('../../logger');

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE || 'fragments';
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'fragments';

class Fragment {
  constructor({
    id,
    ownerId,
    created,
    updated,
    type,
    size,
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
  }

  static pk(ownerId) {
    return { S: ownerId };
  }

  static sk(id) {
    return { S: id };
  }

  static async create(ownerId, type, size) {
    const now = new Date().toISOString();
    const id = uuid();
    const item = {
      ownerId: { S: ownerId },
      id: { S: id },
      created: { S: now },
      updated: { S: now },
      type: { S: type },
      size: { N: String(size) },
    };

    await dynamoClient.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    return new Fragment({
      id,
      ownerId,
      created: now,
      updated: now,
      type,
      size,
    });
  }

  static async byId(ownerId, id) {
    const res = await dynamoClient.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          ownerId: this.pk(ownerId),
          id: this.sk(id),
        },
      }),
    );

    if (!res.Item) return null;

    return new Fragment({
      id: res.Item.id.S,
      ownerId: res.Item.ownerId.S,
      created: res.Item.created.S,
      updated: res.Item.updated.S,
      type: res.Item.type.S,
      size: Number(res.Item.size.N),
    });
  }

  static async byUser(ownerId, expand = false) {
    const res = await dynamoClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'ownerId = :owner',
        ExpressionAttributeValues: {
          ':owner': { S: ownerId },
        },
      }),
    );

    const fragments = res.Items.map(
      (item) =>
        new Fragment({
          id: item.id.S,
          ownerId: item.ownerId.S,
          created: item.created.S,
          updated: item.updated.S,
          type: item.type.S,
          size: Number(item.size.N),
        }),
    );

    if (!expand) return fragments.map((f) => f.id);
    return fragments;
  }

  async setData(buffer) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${this.ownerId}/${this.id}`,
        Body: buffer,
        ContentType: this.type,
      }),
    );

    const now = new Date().toISOString();
    this.size = buffer.length;
    this.updated = now;

    await dynamoClient.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: {
          ownerId: Fragment.pk(this.ownerId),
          id: Fragment.sk(this.id),
        },
        UpdateExpression: 'SET #u = :u, #s = :s',
        ExpressionAttributeNames: {
          '#u': 'updated',
          '#s': 'size',
        },
        ExpressionAttributeValues: {
          ':u': { S: now },
          ':s': { N: String(this.size) },
        },
      }),
    );
  }

  async getData() {
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${this.ownerId}/${this.id}`,
      }),
    );

    const chunks = [];
    for await (const chunk of res.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete() {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${this.ownerId}/${this.id}`,
      }),
    );

    await dynamoClient.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: {
          ownerId: Fragment.pk(this.ownerId),
          id: Fragment.sk(this.id),
        },
      }),
    );
  }
}

module.exports = Fragment;
