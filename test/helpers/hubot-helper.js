const path = require('path');

class Helper {
  constructor(scriptPaths) {
    this.scriptPaths = Array.isArray(scriptPaths) ? scriptPaths : [scriptPaths];
  }

  async createRoom(options = {}) {
    const {
      Robot, User, TextMessage, EnterMessage, LeaveMessage,
    } = await import('hubot');

    const messages = [];
    const roomName = options.name || 'room1';

    const adapter = {
      name: 'mock',
      messages,
      send: async (_envelope, ...strings) => {
        strings.forEach((str) => messages.push(['hubot', str]));
      },
      reply: async (envelope, ...strings) => {
        strings.forEach((str) => messages.push(['hubot', `@${envelope.user.name} ${str}`]));
      },
      run: async () => {},
    };

    const robot = new Robot(adapter, false, 'hubot');

    await this.scriptPaths.reduce(async (previous, scriptPath) => {
      await previous;
      const resolved = path.resolve(process.cwd(), scriptPath);
      await robot.loadFile(path.dirname(resolved), path.basename(resolved));
    }, Promise.resolve());

    robot.brain.emit('loaded');

    return {
      robot,
      messages,
      name: roomName,
      user: {
        say: async (userName, message, userParams = {}) => {
          userParams.room = roomName;
          const user = new User(userName, userParams);
          const textMessage = new TextMessage(user, message);
          messages.push([userName, textMessage.text]);
          await robot.receive(textMessage);
        },
        enter: async (userName, userParams = {}) => {
          userParams.room = roomName;
          const user = new User(userName, userParams);
          await robot.receive(new EnterMessage(user));
        },
        leave: async (userName, userParams = {}) => {
          userParams.room = roomName;
          const user = new User(userName, userParams);
          await robot.receive(new LeaveMessage(user));
        },
      },
      destroy: () => {
        if (robot.server) robot.server.close();
        robot.brain.close();
      },
    };
  }
}

module.exports = Helper;
