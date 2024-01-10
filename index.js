const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashString(str) {
  try {
    const hash = await bcrypt.hash(str, saltRounds);
    return hash;
  } catch (error) {
    console.error('An error occurred while hashing:', error);
    return null;
  }
}

async function unhashString(str, hashedStr) {
  try {
    const match = await bcrypt.compare(str, hashedStr);
    return match;
  } catch (error) {
    console.error('An error occurred while unhashing:', error);
    return null;
  }
}
var hashedString;
hashString('skibidi balls').then((result) => {
  hashedString = result;
  unhashString('originalString', hashedString.toString()).then((unhashedString) => {
    console.log('Hashed string:' + hashedString + '\nUnhashed string:' + unhashedString);
  })
});


const uri = "mongodb+srv://username:quinncoin123@cluster0.gdtunpp.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}

connect();

const accountData = mongoose.model('accountData', new mongoose.Schema({
  username: String,
  password: String,
  age: Number,
  pfpImage: String,
  status: { type: String, default: "I'm new here. Say hi!" },
  friends: { type: Array, default: [] },
  notifications: { type: Array, default: [] }
}));

const DMS = mongoose.model('DMS', new mongoose.Schema({
  from: String,
  to: String
}));


app.use(express.json());

//fetch an account:

app.get('/accounts', async (req, res) => {
  try {
    const accounts = await accountData.find();
    res.status(200).json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching accounts' });
  }
});

//sign up:

app.post('/accounts', async (req, res) => {
  try {
    const { username, password, age, pfpImage } = req.body;
    if (age < 13) {
      return res.status(400).send('You must be 13 or older to register');
    }
    const existingAccount = await accountData.findOne({ username });
    if (existingAccount) {
      return res.status(409).send('Username already exists');
    }
    const newaccount = new accountData({ 
      username, 
      password, 
      age, 
      pfpImage, 
      status: `I'm new here. Say hi!`,
      friends: [],
      notifications: []
    });
    const savedaccount = await newaccount.save();
    savedaccount.friends = [];
    savedaccount.notifications = [];
    await savedaccount.save();
    res.status(201).json(savedaccount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding a new account' });
  }
});

//sign in:

app.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingAccount = await accountData.findOne({ username, password });
    if(existingAccount){
      const pfpImage = existingAccount.pfpImage;
      res.status(200).json({ message: 'Sign in successful', pfpImage: pfpImage });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while signing in' });
  }
});

//get a users friends:

app.get('/getFriends/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await accountData.findOne({ username });
    const friendsArray = user.friends;
    res.status(200).json({ friends: friendsArray });
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    res.status(500).json({ error: 'An error occurred while fetching friends' });
  }
});

//get a users pfp:

app.get('/getProfilePicture/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await accountData.findOne({ username });
    if (user) {
      const profilePicture = user.pfpImage;
      if (profilePicture) {
        res.status(200).json({ url: profilePicture });
      } else {
        res.status(404).json({ error: 'Profile picture not found' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Failed to fetch profile picture for', username, error);
    res.status(500).json({ error: 'An error occurred while fetching profile picture' });
  }
});

//add friend:

app.post('/addFriend', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    if (username === friendUsername) {
      return res.status(400).json('You cannot add yourself as a friend.');
    }
    const user = await accountData.findOne({ username });
    const friend = await accountData.findOne({ username: friendUsername });
    if (!user || !friend) {
      return res.status(404).json({ error: 'User does not exist.'});
    }
    if (user.friends.includes(friendUsername)) {
      return res.status(400).json({ error: 'Friend already added.'});
    }
    user.friends.push(friendUsername);
    await user.save();
    res.status(200).json({ message: 'Friend added successfully.' });
  } catch (error) {
    console.error('An error occurred while adding friend:', error);
    res.status(500).json({ error: 'An error occurred while adding friend.' });
  }
});

//remove friend:

app.delete('/removeFriend', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    const user = await accountData.findOne({ username });
    if (!user || !user.friends.includes(friendUsername)) {
      return res.status(400).json({ error: 'Friend not found in user\'s friend list' });
    }
    user.friends = user.friends.filter(friend => friend !== friendUsername);
    await user.save();
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('An error occurred while removing friend:', error);
    res.status(500).json({ error: 'An error occurred while removing friend' });
  }
});

//post a new notification to a specific user:

app.post('/addNotification', async (req, res) => {
  try {
    const { username, notification } = req.body;
    const user = await accountData.findOne({ username });
    user.notifications.push(notification);
    await user.save();
    res.status(200).json({ message: 'Noficiation added successfully' });
  } catch (error) {
    console.error('An error occurred while adding notif:', error);
    res.status(500).json({ error: 'An error occurred while adding notif.' });
  }
});

//recieve a user's notifications:

app.get('/getUserNotifications/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await accountData.findOne({ username }, 'notifications');
    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.error('Failed to fetch user notifications:', error);
    res.status(500).json({ error: 'An error occurred while fetching user notifications' });
  }
});

//send direct message:

app.post('/sendDirectMessage', async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;
    const senderAccount = await accountData.findOne({ username: sender });
    const recipientAccount = await accountData.findOne({ username: recipient });
    if (!senderAccount || !recipientAccount) {
      return res.status(404).json({ error: 'User does not exist.' });
    }
    if (!senderAccount.friends.includes(recipient) || !recipientAccount.friends.includes(sender)) {
      return res.status(403).json({ error: 'You can only send messages to friends.' });
    }
    // Save the message for the recipient
    recipientAccount.messages.push({ sender: sender, message: message });
    await recipientAccount.save();
    // You can add additional validation or processing here
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('An error occurred while sending message:', error);
    res.status(500).json({ error: 'An error occurred while sending message.' });
  }
});


  //get messages for a recipient:
  app.get('/getMessages/:recipient', async (req, res) => {
    const { recipient } = req.params;
    try {
      const recipientAccount = await accountData.findOne({ username: recipient });
      if (!recipientAccount) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      const messages = recipientAccount.messages;
      res.status(200).json({ messages: messages });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
  });

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    const filteredPosts = posts.filter(post => post.author === username || friendsArray.includes(post.author));
    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});





app.post('/posts', async (req, res) => {
  try {
    const { author, content } = req.body;
    const newPost = new Post({ author, content, likes: 0 });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding a new post' });
  }
});

app.delete('/accounts/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const deletedAccount = await accountData.findOneAndDelete({ username });
    if (deletedAccount) {
      res.status(200).json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    console.error('An error occurred while deleting account:', error);
    res.status(500).json({ error: 'An error occurred while deleting account' });
  }
});

app.post('/changeStatus', async (req, res) => {
  try {
    const { username, status } = req.body;
    const user = await accountData.findOne({ username });
    user.status = status;
    await user.save();
    res.status(200).json({ message: 'Status set successfully.' });
  } catch (error) {
    console.error('An error occurred while changing status:', error);
    res.status(500).json({ error: 'An error occurred while changing status.' });
  }
});





// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8000, () => {
  console.log("server started on port 8000");
});