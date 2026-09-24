import { Box, Container, Group } from "@mantine/core";

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <Container
      strategy="grid"
      size={850}
      mih="100dvh"
      style={{ gridTemplateRows: "auto 1fr auto" }}
    >
      <Box component="header" data-breakout bg="var(--cwrublue)" p="md">
        <Group data-container c="white" justify="center">
          <div>Container inside breakout</div>
        </Group>
      </Box>
      {children}
      <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
        <Group data-container justify="center">
          <div>Container inside breakout</div>
        </Group>
      </Box>
    </Container>
  );
};

export default Wrapper;
