// MongoDB Initialization Script for FUN App

// Switch to fun database
db = db.getSiblingDB('fun');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        passwordHash: {
          bsonType: 'string',
          minLength: 60,
          description: 'must be a bcrypt hash'
        },
        displayName: {
          bsonType: 'string'
        },
        credits: {
          bsonType: 'number',
          minimum: 0
        },
        isPremium: {
          bsonType: 'bool'
        },
        walletAddress: {
          bsonType: ['string', 'null']
        }
      }
    }
  }
});

db.createCollection('series');
db.createCollection('unlocks');
db.createCollection('transactions');
db.createCollection('products');
db.createCollection('comments');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ walletAddress: 1 }, { sparse: true });
db.users.createIndex({ createdAt: 1 });

db.series.createIndex({ title: 'text', description: 'text' });
db.series.createIndex({ slug: 1 }, { unique: true });
db.series.createIndex({ genres: 1 });
db.series.createIndex({ 'stats.views': -1 });
db.series.createIndex({ createdAt: -1 });

db.unlocks.createIndex({ userId: 1, seriesId: 1, episodeNum: 1 }, { unique: true });
db.unlocks.createIndex({ userId: 1, timestamp: -1 });
db.unlocks.createIndex({ seriesId: 1 });

db.transactions.createIndex({ userId: 1, timestamp: -1 });
db.transactions.createIndex({ transactionId: 1 }, { sparse: true });
db.transactions.createIndex({ status: 1 });

db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });

db.comments.createIndex({ seriesId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1 });

// Insert sample data for development
db.series.insertOne({
  title: 'Ketamine Horse',
  slug: 'ketamine-horse',
  description: 'A thrilling drama series about... a horse on ketamine',
  genres: ['Drama', 'Thriller', 'Comedy'],
  thumbnailUrl: 'https://placeholder.com/horse.jpg',
  trailerUrl: 'https://cloudfront.net/trailers/horse.m3u8',
  episodes: [
    {
      episodeNum: 1,
      title: 'The Beginning',
      videoUrl: 'https://cloudfront.net/series/horse/ep1/master.m3u8',
      thumbnailUrl: 'https://placeholder.com/horse-ep1.jpg',
      duration: 180,
      isFree: true,
      unlockCostCredits: 0,
      unlockCostUSD: 0,
      premiumOnly: false,
      tags: []
    },
    {
      episodeNum: 2,
      title: 'The Journey',
      videoUrl: 'https://cloudfront.net/series/horse/ep2/master.m3u8',
      thumbnailUrl: 'https://placeholder.com/horse-ep2.jpg',
      duration: 165,
      isFree: true,
      unlockCostCredits: 0,
      unlockCostUSD: 0,
      premiumOnly: false,
      tags: []
    },
    {
      episodeNum: 3,
      title: 'The Revelation',
      videoUrl: 'https://cloudfront.net/series/horse/ep3/master.m3u8',
      thumbnailUrl: 'https://placeholder.com/horse-ep3.jpg',
      duration: 195,
      isFree: false,
      unlockCostCredits: 50,
      unlockCostUSD: 0.99,
      premiumOnly: false,
      tags: []
    }
  ],
  stats: {
    views: 12500,
    likes: 3400,
    favorites: 890,
    completionRate: 0.72
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed for FUN app');
