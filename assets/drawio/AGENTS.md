This directory is used to maintain mindmap diagrams from the theoretical minimum lectures series. Here is a reference you can view: https://theoreticalminimum.com

My general flow is:
- Read a chapter (i.e. "Lecture") in the book
- Highlight/annotate passages that are key to the lecture
- Watch the video lecture on YouTube
- Copy the most important passages to a markdown file (i.e. "B1L2.md"). Inside this file, I will denote different types of passages with square brackets (i.e. [<passage type>]).
- Create a drawio diagram ("B1L2.draw.io") from these notes to better visualize the relationships between the diagrams.

There is a 1:1 correspondence between markdown files and drawio visualizations. They contain the same equations and concepts, but typically the drawio has additional graphics that I make inside the software.

In the drawio diagram, there are categories of containers:
- "Orange" overall container that contains all other containers (i.e. the background of diagram). Sometimes I have to keep this compressed while I edit subcontainers so that things can be arranged cleanly.
- "Green" concept container that contains key definitions, concepts, summaries, or other free form text
- "Purple" equation containers that contain definitions of key equations. These are all titled and formatted in latex.
- "Green" diagram containers that contain an illustration with a title

See template.drawio for examples of each of these containers.

Containers are then linked with arrows to help me remember the dependencies in the concepts.

After creation, these will be exported to `.png` format and included in my blog (so I can reference in later lectures). I like to then "lock" the diagram so I don't edit it by mistake.

Sometimes I have to split up a diagram into multiple pages so it fits nicely on my blog post.

One common command I might give you is to "convert B<book number>L<lecture number> into a diagram". What I mean by this is populate the appropriate containers with the latex/markdown text. Then I will re-position, draw arrows, and post-process the containers in the software.
