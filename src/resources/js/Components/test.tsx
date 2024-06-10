import React from 'react';

interface TestProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; 
}

const Test: React.FC<TestProps> = ({ isOpen, onClose, onUpdate }) => {
    return (
        <div className="overflow-hidden shadow-sm sm:rounded-lg">
            <div className="mb-2 flex justify-end">
                <button className="text-white bg-green-500 px-4 py-2 rounded-md mr-2" onClick={onUpdate}>
                    更新
                </button>
                <button className="text-white bg-gold px-4 py-2 rounded-md" onClick={onClose}>
                    閉じる
                </button>
            </div>
            <table className="w-full border-4 border-lightblue bg-deepblue">
                <thead>
                    <tr className='text-white grid grid-cols-8 text-white border-b-2 border-lightblue mr-2 ml-2'>
                        <th className="py-3 px-4 text-center">No</th>
                        <th className="py-3 px-4 text-center">商品名</th>
                        <th className="py-3 px-4 text-center">型番</th>
                        <th className="py-3 px-4 text-center">納品場所</th>
                        <th className="py-3 px-4 text-center">入庫数量</th>
                        <th className="py-3 px-4 text-center">出庫数量</th>
                        <th className="py-3 px-4 text-center">在庫数量</th>
                        <th className="py-3 px-4 text-center">備考</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className=' mt-4 mr-2 ml-2 mb-2 grid grid-cols-8 text-white border-2 border-lightblue rounded-md'>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-1 text-center">商品A</td>
                        <td className="py-3 px-1 text-center">A-001</td>
                        <td className="py-3 px-1 text-center">東京倉庫</td>
                        <td className="py-3 px-1 text-center">
                            <input
                                type='text'
                                className='w-20 border-lightblue bg-deepblue text-white text-center'
                                defaultValue="100"
                            />
                        </td>
                        <td className="py-3 px-1 text-center">
                            <input
                                type='text'
                                className='w-20 border-lightblue bg-deepblue text-white text-center'
                                defaultValue="10"
                            />
                        </td>
                        <td className="py-3 px-1 text-center">90</td>
                        <td className="py-3 px-4 text-center">
                            <button className="text-white bg-gold px-4 py-2 rounded-md" onClick={onClose}>
                                詳細
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Test;
