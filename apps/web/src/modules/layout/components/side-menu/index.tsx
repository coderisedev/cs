"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Collections: "/collections",
  Software: "/software",
  Blog: "/blog",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center gap-1 transition-all ease-out duration-200 focus:outline-none hover:text-primary"
                >
                  {/* Hamburger Icon */}
                  <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                    <span className="w-full h-0.5 bg-current transition-all" />
                    <span className="w-full h-0.5 bg-current transition-all" />
                    <span className="w-full h-0.5 bg-current transition-all" />
                  </div>
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
                  <div
                    data-testid="nav-menu-popup"
                    className="fixed inset-y-0 left-0 w-full sm:w-80 bg-background-primary shadow-2xl flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <h2 className="text-xl font-bold text-foreground-primary">Menu</h2>
                      <button 
                        data-testid="close-menu-button" 
                        onClick={close}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-secondary transition-colors"
                      >
                        <XMark className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Navigation Links */}
                    <ul className="flex-1 flex flex-col gap-2 p-6 overflow-y-auto">
                      {Object.entries(SideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className="block px-4 py-3 text-lg font-medium text-foreground-primary hover:bg-background-secondary hover:text-primary rounded-lg transition-colors"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>

                    {/* Footer */}
                    <div className="p-6 border-t border-border space-y-4">
                      <div
                        className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="text-sm text-foreground-secondary">
                        © {new Date().getFullYear()} CockpitSim. All rights reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
