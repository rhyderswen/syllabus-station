import lineupLogo from "@/assets/lineup-full.png";  // placeholder to figure out spacing
import { useRef, useState } from 'react';
import { Box, Container, Button, Group, Autocomplete, Loader } from "@mantine/core";

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <Container
      strategy="grid"
      size={850}
      mih="100dvh"
      style={{ gridTemplateRows: "auto minmax(500px, 1fr) auto" }}
    >
      <Box component="header" data-breakout bg="var(--cwrublue)" p="md">
        <Group data-container c="white" justify="center" display='flex'>
          <div className="lineUpLogo" style={{flex:1}}>
            <img src={lineupLogo} alt="LineUp Logo" height={50} />
          </div>
          <Autocomplete
            style={{flex:5}}
            placeholder="Search for a course..."
            data={['CSDS 132: Introduction to Java', 'CSDS 233: Data Structures', 'CSDS 393: Software Engineering', 'CSDS 395: Senior Project in Computer Science']}
            //rightSection={loading ? <Loader size={16} /> : null} // This will be used later for a loading circle to appear on the right edge of the search bar while searching
            //in the final version, this and the below button will only appear when authenticated
          />
          <Button style={{flex:1, fontSize:14, background:'#007ab8'}}>
            Upload Syllabus
          </Button>
        </Group>
      </Box>

      {children}
      
      <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
        <Group data-container justify="center" display='flex'>
          <div style={{flex:1}}>
            <ul>
              <li><a href='/'>Log Out</a></li>
              <li><a href='/'>Related link 2</a></li>
              <li><a href='/'>Related link 3</a></li>
            </ul>
          </div>
          <div style={{flex:2}}><i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion 
                of the instructor. Do not assume information from a syllabus linked here is 100% accurate
                to a course's content.
          </div>
        </Group>
      </Box>
    </Container>
  );
};

export default Wrapper;
