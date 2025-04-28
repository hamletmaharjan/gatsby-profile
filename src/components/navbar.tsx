import * as React from "react";
import { Link as GatsbyLink } from "gatsby";
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Link,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

export const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activePath, setActivePath] = React.useState<string>("");

  React.useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/about-me", label: "About" },
    { to: "/blogs", label: "Blogs" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <Box as="nav" w="100%" bg="white" p={4}>
      <Flex justify="space-between" align="center" maxW="960px" mx="auto">
        <Link
          as={GatsbyLink}
          to="/"
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#663399",
            textDecoration: "none",
            marginLeft: { base: "0", md: "0", lg: "16px" },
          }}
        >
          Hamlet
        </Link>
        <Flex display={{ base: "none", md: "flex" }} gap={6} align="center">
          {navLinks.map(({ to, label }) => (
            <Link
              as={GatsbyLink}
              key={to}
              to={to}
              style={{
                fontSize: "1rem",
                color: "#232129",
                textDecoration: "none",
                padding: "8px 16px",
                ...(activePath === to ? { color: "#663399" } : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </Flex>
        <IconButton
          display={{ base: "block", md: "none" }}
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
        />
      </Flex>

      {/* Customizable Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  as={GatsbyLink}
                  to={to}
                  style={{
                    fontSize: "1rem",
                    color: "#232129",
                    textDecoration: "none",
                    ...(activePath === to ? { color: "#663399" } : {}),
                  }}
                  onClick={onClose}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
