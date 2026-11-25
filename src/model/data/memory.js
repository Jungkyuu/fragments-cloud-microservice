// src/model/data/memory.js
const { v4: uuid } = require('uuid');

const fragments = new Map();
const dataStore = new Map();

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

  static async create(ownerId, type, size) {
    const now = new Date().toISOString();
    const id = uuid();

    const fragment = new Fragment({
      id,
      ownerId,
      created: now,
      updated: now,
      type,
      size,
    });

    fragments.set(`${ownerId}:${id}`, fragment);
    return fragment;
  }

  static async byId(ownerId, id) {
    return fragments.get(`${ownerId}:${id}`) || null;
  }

  static async byUser(ownerId, expand = false) {
    const result = [];
    for (const fragment of fragments.values()) {
      if (fragment.ownerId === ownerId) result.push(fragment);
    }
    if (!expand) return result.map((f) => f.id);
    return result;
  }

  async setData(buffer) {
    this.size = buffer.length;
    this.updated = new Date().toISOString();
    dataStore.set(`${this.ownerId}:${this.id}`, buffer);
  }

  async getData() {
    return dataStore.get(`${this.ownerId}:${this.id}`) || Buffer.from('');
  }

  async delete() {
    fragments.delete(`${this.ownerId}:${this.id}`);
    dataStore.delete(`${this.ownerId}:${this.id}`);
  }
}

module.exports = Fragment;
