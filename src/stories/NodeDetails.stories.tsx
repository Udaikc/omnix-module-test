import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import NodeDetails from "../components/NodeDetails"; // Adjust the path based on your project structure
import { ComponentProps } from "react";

export default {
    title: "Components/NodeDetails",
    component: NodeDetails,
    argTypes: {
        selectedNodes: {
            control: {
                type: "object", // Use "object" instead of "array" for lists
            },
            description: "List of selected nodes displayed in the component.",
        },
    },
} as Meta<typeof NodeDetails>;

// Define a generic template for all stories
const Template: StoryFn<ComponentProps<typeof NodeDetails>> = (args) => <NodeDetails {...args} />;

// Default Story (No nodes selected)
export const Default = Template.bind({});
Default.args = {
    selectedNodes: [],
};

// Single Node Selected
export const SingleNode = Template.bind({});
SingleNode.args = {
    selectedNodes: ["Node A"],
};

// Multiple Nodes Selected
export const MultipleNodes = Template.bind({});
MultipleNodes.args = {
    selectedNodes: ["Node A", "Node B", "Node C"],
};

// Long List of Nodes Selected
export const ManyNodes = Template.bind({});
ManyNodes.args = {
    selectedNodes: Array.from({ length: 20 }, (_, i) => `Node ${i + 1}`),
};
