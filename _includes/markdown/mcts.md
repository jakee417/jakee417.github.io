```python
import numpy as np
import pandas as pd
from src.mcts import mcts
from src.node import MCTSNode
from src.open_ai import get_candidates_fn, get_simulation_fn, get_reward_fn
from IPython.display import display, Markdown
from src.utils import create_graph_html

np.random.seed(1)
```


```python
# Chinese text we want to translate (from Twenty Thousand Leagues Under the Sea).
CHINESE = "这事大体是这样：不久以前，好些大船在海上碰见了一一个“庞然大物”，一个很长的物体，形状很像纺锤，有时发出磷光，它的体积比鲸鱼大得多，行动起来也比鲸鱼快得多。"
# Official translation (as given by http://bilinguis.com/book/verne20k/en/zh/p1c1/).
ORIGINAL = 'In essence, over a period of time several ships had encountered "an enormous thing" at sea, a long spindle-shaped object, sometimes giving off a phosphorescent glow, infinitely bigger and faster than any whale.'
# The translation given by google translate.
GOOGLE_TRANSLATE = 'The story goes something like this: Not long ago, a number of large ships encountered a "monster" at sea, a very long object, shaped like a spindle, sometimes emitting phosphorescence. It was much larger than a whale and moved much faster than a whale.'
```


```python
# This few shot prompt will be used for expansion and simulation.
generation_prompt = f"""Chinese text needs to be translated into English.
- Do not provide any context or description, just the translation.
- A user will start the translation. Complete the translation without repeating what has already been translated.

Translate the following:
{CHINESE}
"""
```


```python
# This prompt will be used for calculating the reward with an LLM judge.
example_1 = '{"completeness": 1.0, "correctness": 0.6, "elegance": 0.5}'
example_2 = '{"completeness": 1.0, "correctness": 0.95, "elegance": 1.0}'
reward_prompt = f"""Provide scores between 0 and 1 of how well the english has been translated from Chinese. Respond in json format for the following keys:
- 'correctness' value between 0 and 1 - if each pinyin token correctly translates into english tokens.
- 'brevity' value between 0 and 1 - if there is no redundancy in the translation.
- 'elegance' value between 0 and 1 - if the translation matches the original prose and is pleasurable to read.

Example:
Pinyin: shuǐ dī shí chuān.
English: Dropping water can penetrate the stone, sometimes.
Response: {example_1}

Chinese: 學而時習之，不亦悅乎？
English: To learn and to practice what is learned time and again is pleasure, is it not?
Response: {example_2}

Translate the following:
{CHINESE}
"""
```


```python
# Run MCTS and visualize the algorithm's history.
root, node, history = mcts(
    get_candidates_fn=get_candidates_fn(
        prompt=generation_prompt,
        # Consider candidates which add at most 5 tokens.
        max_completion_tokens=5,
        # Consider 3 alternatives at each step.
        top_logprobs=3,
        # Consider candidates with at least 3 tokens.
        minimum_candidate_token_length=3,
    ),
    get_simulation_fn=get_simulation_fn(
        prompt=generation_prompt,
        # Do not limit how far we simulate.
        max_completion_tokens=None,
    ),
    get_rewards_fn=get_reward_fn(prompt=reward_prompt),
    # Number of total MCTS iterations. Each iteration will have a expansion, simulation, and reward API call.
    max_rollouts=8,
    # Print out the logging.
    verbose=True,
)
```

    {'actions': [['root']]}
    {'step': 0, 'actions': [['expansion'], ['simulation'], ['reward']], 'reward': 0.933}
    {'step': 1, 'actions': [['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.95}
    {'step': 2, 'actions': [['selection'], ['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.95}
    {'step': 3, 'actions': [['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.95}
    {'step': 4, 'actions': [['selection'], ['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.933}
    {'step': 5, 'actions': [['selection'], ['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.933}
    {'step': 6, 'actions': [['selection'], ['selection'], ['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.917}
    {'step': 7, 'actions': [['selection'], ['selection'], ['selection'], ['expansion'], ['simulation'], ['reward']], 'reward': 0.95}



```python
# Find the best reward and its state from after all of the simulation steps.
best_reward_state, best_reward_simulation, best_reward = max(
    [v for i in history for k, v in i.items() if k == "reward"], key=lambda x: x[1]
)
print(f"State -> {best_reward_state}")
print(f"Simulation -> {best_reward_simulation}")
```

    State -> This matter is generally like
    Simulation -> this: not long ago, several large ships encountered a "colossal creature" in the sea, a very long object that was spindle-shaped, sometimes emitting phosphorescence. Its size was much larger than that of a whale, and it moved much faster than a whale.



```python
# See what a one-shot generation without MCTS would give.
one_shot = get_simulation_fn(prompt=generation_prompt)(
    MCTSNode(prob=0.0, state="", type="one_shot")
)
```


```python
# Compare the various translations.
display(
    Markdown(
        pd.DataFrame(
            {
                "type": [
                    "Chinese",
                    "Author's Translation",
                    "Google Translate",
                    "One Shot",
                    "MCTS",
                ],
                "text": [
                    CHINESE,
                    ORIGINAL,
                    GOOGLE_TRANSLATE,
                    one_shot,
                    best_reward_state + " " + best_reward_simulation,
                ],
            }
        ).to_markdown()
    )
)
```


|    | type                 | text                                                                                                                                                                                                                                                                                          |
|---:|:---------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  0 | Chinese              | 这事大体是这样：不久以前，好些大船在海上碰见了一一个“庞然大物”，一个很长的物体，形状很像纺锤，有时发出磷光，它的体积比鲸鱼大得多，行动起来也比鲸鱼快得多。                                                                                                                                    |
|  1 | Author's Translation | In essence, over a period of time several ships had encountered "an enormous thing" at sea, a long spindle-shaped object, sometimes giving off a phosphorescent glow, infinitely bigger and faster than any whale.                                                                            |
|  2 | Google Translate     | The story goes something like this: Not long ago, a number of large ships encountered a "monster" at sea, a very long object, shaped like a spindle, sometimes emitting phosphorescence. It was much larger than a whale and moved much faster than a whale.                                  |
|  3 | One Shot             | This matter is generally as follows: Not long ago, several large ships encountered a "colossal being" in the sea, a very long object that resembled a spindle, sometimes emitting phosphorescent light; its size was much larger than that of a whale, and it moved much faster than a whale. |
|  4 | MCTS                 | This matter is generally like this: not long ago, several large ships encountered a "colossal creature" in the sea, a very long object that was spindle-shaped, sometimes emitting phosphorescence. Its size was much larger than that of a whale, and it moved much faster than a whale.     |



```python
# Visualize the trees with pyvis.
create_graph_html(root=root, filename="graph.html", height="300px")
```

    graph.html

