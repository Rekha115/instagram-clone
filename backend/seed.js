import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';
import Follow from './models/Follow.js';
import Comment from './models/Comment.js';
import Notification from './models/Notification.js';
import SavedPost from './models/SavedPost.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/instagram';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Follow.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await SavedPost.deleteMany({});
    console.log('Database cleared.');

    // Helper to hash password
    const passwordHash = await bcrypt.hash('password123', 12);

    // Create 3 Sample Users
    const john = await User.create({
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john@example.com',
      password: passwordHash,
      bio: 'Adventure traveler & photographer 🌍📸',
      website: 'johndoe.com',
      gender: 'male',
      profilePicture: {
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        publicId: 'mock_pfp_john',
      },
      isVerified: true,
    });

    const jane = await User.create({
      username: 'jane_smith',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: passwordHash,
      bio: 'Fashion designer & tech enthusiast 💻✨',
      website: 'janesmith.design',
      gender: 'female',
      profilePicture: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        publicId: 'mock_pfp_jane',
      },
      isVerified: false,
    });

    const travel = await User.create({
      username: 'travel_escape',
      fullName: 'Travel Escape',
      email: 'travel@example.com',
      password: passwordHash,
      bio: 'Escape the ordinary. Discover the world! 🗺️✈️',
      website: 'travel-escapes.com',
      gender: 'prefer-not-to-say',
      profilePicture: {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&h=150&fit=crop',
        publicId: 'mock_pfp_travel',
      },
      isVerified: true,
    });

    console.log('Sample users created successfully.');

    // Create Follow Relationships (Make everyone follow each other so home feed is populated)
    // 1. John follows Jane and Travel
    await Follow.create({ follower: john._id, following: jane._id });
    await Follow.create({ follower: john._id, following: travel._id });
    john.following.push(jane._id, travel._id);

    // 2. Jane follows John and Travel
    await Follow.create({ follower: jane._id, following: john._id });
    await Follow.create({ follower: jane._id, following: travel._id });
    jane.following.push(john._id, travel._id);

    // 3. Travel follows John and Jane
    await Follow.create({ follower: travel._id, following: john._id });
    await Follow.create({ follower: travel._id, following: jane._id });
    travel.following.push(john._id, jane._id);

    // Update followers arrays
    john.followers.push(jane._id, travel._id);
    jane.followers.push(john._id, travel._id);
    travel.followers.push(john._id, jane._id);

    await john.save();
    await jane.save();
    await travel.save();
    console.log('Follow relationships created.');

    // Create standard Image Posts
    const post1 = await Post.create({
      author: john._id,
      caption: 'Exploring the gorgeous landscapes of Norway! 🇳🇴🏔️ #travel #nature',
      location: 'Lofoten Islands, Norway',
      postType: 'post',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080',
          publicId: 'mock_post_norway',
          type: 'image',
        },
      ],
    });

    const post2 = await Post.create({
      author: jane._id,
      caption: 'Loving this minimal office workspace setup. Simple & clean 💻⌨️ #desksetup #minimalism',
      location: 'New York, USA',
      postType: 'post',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1080',
          publicId: 'mock_post_workspace',
          type: 'image',
        },
      ],
    });

    // Create Reels (Videos)
    const reel1 = await Post.create({
      author: travel._id,
      caption: 'Waterfalls in deep wild valleys are breathtaking! 🌊🌲 #nature #reels #explore',
      location: 'Bali, Indonesia',
      postType: 'reel',
      media: [
        {
          url: 'https://www.w3schools.com/html/movie.mp4',
          publicId: 'mock_reel_waterfall',
          type: 'video',
        },
      ],
    });

    const reel2 = await Post.create({
      author: john._id,
      caption: 'Catching the perfect sunset glow. 🌇✨ #sunset #reels #vibes',
      location: 'Santorini, Greece',
      postType: 'reel',
      media: [
        {
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          publicId: 'mock_reel_sunset',
          type: 'video',
        },
      ],
    });
    const reel3 = await Post.create({
      author: jane._id,
      caption: 'Exploring the vibrant street art scene in Berlin! 🎨🏙️ #streetart #berlin #culture',
      location: 'Berlin, Germany',
      postType: 'reel',
      media: [
        {
          url: 'https://www.w3schools.com/html/movie.mp4',
          publicId: 'mock_reel_streetart',
          type: 'video',
        },
      ],
    });

    console.log('Sample posts and reels created successfully.');

    // Add some Comments
    const comment1 = await Comment.create({
      post: post1._id,
      author: jane._id,
      text: 'Wow, this looks absolutely stunning! Adding Norway to my bucket list ASAP.',
    });
    post1.comments.push(comment1._id);
    await post1.save();

    const comment2 = await Comment.create({
      post: reel1._id,
      author: john._id,
      text: 'Incredible capture! The water stream looks so pure.',
    });
    reel1.comments.push(comment2._id);
    await reel1.save();

    const comment3 = await Comment.create({
      post: reel3._id,
      author: travel._id,
      text: 'These street art pieces are amazing! Berlin always has such a vibrant creative scene.',
    });
    reel3.comments.push(comment3._id);
    await reel3.save();

    console.log('Sample comments added.');
    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('You can log in as:');
    console.log('  Username: john_doe | Password: password123');
    console.log('  Username: jane_smith | Password: password123');
    console.log('  Username: travel_escape | Password: password123');
    console.log('--------------------------------------');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
