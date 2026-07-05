import { Devvit, Post } from '@devvit/public-api';

// Side-effect import bundles the server. The `/index` path is required.
import '../server/index';
import { defineConfig } from '@devvit/server';
import { getDailyPrompt } from '../server/core/prompts';
import { roundConfigNew } from '../server/core/state';

defineConfig({
  name: 'Hive Mind',
  entry: 'index.html',
  height: 'tall',
  menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({ text = 'Loading the hive…' }) => {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle" backgroundColor="#1a1206">
        <text size="xxlarge">🐝</text>
        <spacer size="small" />
        <text maxWidth={'80%'} size="large" weight="bold" alignment="center middle" wrap color="#ffb700">
          {text}
        </text>
      </vstack>
    </zstack>
  );
};

// Moderators create a new daily round from the subreddit "..." menu.
Devvit.addMenuItem({
  label: 'Hive Mind: New daily round',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const prompt = getDailyPrompt();

    let post: Post | undefined;
    try {
      const subreddit = await reddit.getCurrentSubreddit();
      post = await reddit.submitPost({
        title: `🧠 Hive Mind — ${prompt.text}`,
        subredditName: subreddit.name,
        preview: <Preview text={prompt.text} />,
      });
      await roundConfigNew(context.redis as never, post.id, prompt);
      ui.showToast({ text: 'New Hive Mind round posted!' });
      ui.navigateTo(post.url);
    } catch (error) {
      if (post) await post.remove(false);
      const message = error instanceof Error ? error.message : 'Error creating post';
      ui.showToast({ text: message });
    }
  },
});

export default Devvit;
