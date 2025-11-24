import React from 'react';
import { Footer, FooterTitle } from 'flowbite-react';

export function FooterComp() {
  return (
    <Footer container>
      <div className="w-full text-center">
        <FooterTitle title=" All images copyright EPIDGames." />
      </div>
    </Footer>
  );
}

export default FooterComp;
