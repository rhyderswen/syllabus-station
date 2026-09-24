import lineupLogo from "@/assets/lineup-full.png";  // placeholder to figure out spacing
import { useRef, useState } from 'react';
import { Box, Container, Group, Autocomplete, Loader } from "@mantine/core";

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
        <Group data-container c="white" justify="center" display='flex'>
          <div className="lineUpLogo" style={{flex:1}}>
            <img src={lineupLogo} alt="LineUp Logo" height={50} />
          </div>
          <Autocomplete
            style={{flex:7}}
            placeholder="Search for a course..."
            data={['CSDS 132', 'CSDS 233', 'CSDS 393', 'CSDS 395']}
            //rightSection={loading ? <Loader size={16} /> : null} // This will be used later for a loading circle to appear on the right edge of the search bar while searching
            //in the final version, this will only appear when authenticated
          />
        </Group>
      </Box>
      {children}
      <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
        <Group data-container justify="center" display='flex'>
          <div style={{flex:1}}>
            <ul>
              <li><a href='/'>Related link 1</a></li>
              <li><a href='/'>Related link 2</a></li>
              <li><a href='/'>Related link 3</a></li>
            </ul>
          </div>
          <div style={{flex:2}}><i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion 
                of the instructor. Do not assume information from a syllabus linked here is 100% accurate
                to a course's content.</div>
        </Group>
      </Box>
    </Container>
  );
};

export default Wrapper;
