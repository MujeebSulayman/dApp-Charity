import React from 'react'
import { HiChevronDown } from 'react-icons/hi'
import { Menu } from '@headlessui/react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useDispatch } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { CharityStruct } from '@/utils/type.dt'

interface PageProp {
  charity: CharityStruct
  admin?: string
}

const NavBtn: React.FC<PageProp> = ({ charity, admin }) => {
  const { address } = useAccount()
  const dispatch = useDispatch()
  const { setDeleteModal, setBanModal } = globalActions

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/donations/create', label: 'Create Charity' },
    { href: '/projects', label: 'My Charities' },
  ]

  return (
    <Menu as="div" className="relative text-left">
      {({ open }) => (
        <>
          <Menu.Button
            className="p-3 bg-green-600 rounded-full text-white shadow-lg
          fixed right-10 bottom-10"
          >
            <HiChevronDown
              size={17}
              className={
                open
                  ? 'rotate-180 transform transition-transform duration-300'
                  : 'transform transition-transform duration-300'
              }
            />
          </Menu.Button>
          <Menu.Items
            className="fixed right-10 bottom-[90px] w-56 origin-top-right
            divide-y divide-gray-200 rounded-md shadow-lg
            ing-1 ring-opacity-5 focus:outline-none border border-gray-200"
          >
            {menuItems.map((item) => (
              <Menu.Item key={item.href}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={`flex justify-start items-center bg-white space-x-1 ${
                      active ? 'text-white bg-green-600' : 'text-black'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm
                      hover:bg-green-600 hover:text-white`}
                  >
                    <span>{item.label}</span>
                  </Link>
                )}
              </Menu.Item>
            ))}

            {charity && address === charity.owner && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={'/donations/edit/' + charity.id}
                      className={`flex justify-start items-center bg-white space-x-1 ${
                        active ? 'text-white bg-green-600' : 'text-black'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm
                      hover:bg-green-600 hover:text-white`}
                    >
                      <span>Edit Charity</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => dispatch(setDeleteModal('scale-100'))}
                      className={`flex justify-start items-center bg-white space-x-1 ${
                        active ? 'text-white bg-red-600' : 'text-red-600'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm
                      hover:bg-red-600 hover:text-white`}
                    >
                      <span>Delete Charity</span>
                    </button>
                  )}
                </Menu.Item>
              </>
            )}

            {charity && address === admin && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => dispatch(setBanModal('scale-100'))}
                    className={`flex justify-start items-center bg-white space-x-1 ${
                      active ? 'text-white bg-red-600' : 'text-red-600'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm
                      hover:bg-red-600 hover:text-white`}
                  >
                    <span>Ban Charity</span>
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </>
      )}
    </Menu>
  )
}

export default NavBtn
