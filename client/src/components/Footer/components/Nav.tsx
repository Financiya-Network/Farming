import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink
        target="_blank"
        href="https://etherscan.io/address/0x75B8c48Bdb04d426aeD57b36BB835aD2dC321c30"
      >
        Contract
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/cyclese96/PolkaBridge-Farming">
        Github
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/realpolkabridge">
        Twitter
      </StyledLink>
      <StyledLink target="_blank" href="https://t.me/polkabridgegroup">
        Telegram
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.gg/tzemFksyZB">
        Discord
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 767px) {
    font-size: 14px;
  }
`

const StyledLink = styled.a`
  color: ${(props) => props.theme.color.grey[100]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  @media (max-width: 767px) {
    padding-left: ${(props) => props.theme.spacing[2]}px;
    padding-right: ${(props) => props.theme.spacing[2]}px;
  }
  &:hover {
    color: ${(props) => props.theme.color.primary.main};
  }
`

export default Nav
